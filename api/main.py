"""
FastAPI wrapper around palm_prototype.
Run: uvicorn api.main:app --reload --port 8000
  (from /Users/trantrunghieu/Documents/falm)
"""

import asyncio
import base64
import os
import sys
import traceback
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env", override=True)

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

_PROTO = Path(__file__).parent.parent / "palm_prototype"
sys.path.insert(0, str(_PROTO))

from preprocess import preprocess_palm  # noqa: E402
from palm_reader import read_palm       # noqa: E402

# ── Key rotation ──────────────────────────────────────────────────

class _KeyRotator:
    """Round-robin over multiple Gemini API keys."""

    def __init__(self) -> None:
        raw = (
            os.environ.get("GEMINI_API_KEYS")
            or os.environ.get("GEMINI_API_KEY")
            or os.environ.get("GOOGLE_API_KEY")
            or os.environ.get("OPENAI_API_KEYS")
            or os.environ.get("OPENAI_API_KEY", "")
        )
        self._keys = [k.strip() for k in raw.split(",") if k.strip()]
        self._idx = 0
        if self._keys:
            print(f"[KeyRotator] {len(self._keys)} key(s) loaded.")
        else:
            print("[KeyRotator] WARNING: no API keys found!")

    def current(self) -> str:
        if not self._keys:
            return ""
        return self._keys[self._idx % len(self._keys)]

    def rotate(self) -> str:
        """Advance to next key and return it."""
        if not self._keys:
            return ""
        self._idx = (self._idx + 1) % len(self._keys)
        print(f"[KeyRotator] switched to key index {self._idx}")
        return self._keys[self._idx]

    def __len__(self) -> int:
        return len(self._keys)


_rotator = _KeyRotator()

# ── App ───────────────────────────────────────────────────────────

_EXPECTED_HAND = {"Nam": "Left", "Nữ": "Right"}
_HAND_VI = {"Left": "tay trái", "Right": "tay phải"}

app = FastAPI(title="FALM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_handler(_req, exc: Exception):
    tb = traceback.format_exc()
    print(tb)
    return JSONResponse(status_code=500, content={"detail": str(exc), "traceback": tb})


@app.get("/health")
def health():
    return {"status": "ok", "keys": len(_rotator), "provider": "gemini"}


# ── Step 1: preprocess (MediaPipe — fast) ────────────────────────

@app.post("/api/preprocess")
async def preprocess_endpoint(
    file: UploadFile = File(...),
    gender: str = Form("Nam"),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="File ảnh rỗng.")

    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise HTTPException(status_code=400, detail="Không thể đọc ảnh. Hãy dùng JPEG hoặc PNG.")

    roi, msg, detected_hand = preprocess_palm(img_bgr)
    if roi is None:
        raise HTTPException(status_code=422, detail=f"Không phát hiện bàn tay: {msg}")

    _, buf = cv2.imencode(".jpg", roi, [cv2.IMWRITE_JPEG_QUALITY, 85])
    roi_b64 = base64.b64encode(buf.tobytes()).decode()

    expected_hand = _EXPECTED_HAND.get(gender, "Left")
    wrong_hand = detected_hand is not None and detected_hand != expected_hand

    return {
        "roi_image": roi_b64,
        "detected_hand": detected_hand,
        "wrong_hand": wrong_hand,
        "detected_vi": _HAND_VI.get(detected_hand or "", ""),
        "expected_vi": _HAND_VI.get(expected_hand, ""),
    }


# ── Step 2: read-palm (Gemini — slow, with key rotation) ─────────

def _is_retryable(msg: str) -> bool:
    return any(code in msg for code in ("503", "UNAVAILABLE", "500"))

def _is_fatal(msg: str) -> bool:
    """Errors that affect the whole org — no point trying other keys."""
    return any(t in msg for t in ("restricted", "suspended", "banned"))

def _should_rotate(msg: str) -> bool:
    """Rotate key when current key is rate-limited or individually invalid."""
    triggers = (
        "429", "RESOURCE_EXHAUSTED",
        "403", "PERMISSION_DENIED",
        "401", "UNAUTHENTICATED",
        "invalid_api_key", "API_KEY_INVALID", "expired",
    )
    return any(t in msg for t in triggers)


@app.post("/api/read-palm")
async def read_palm_endpoint(
    roi_b64: str = Form(...),
    gender: str = Form("Nam"),
    extra_question: str = Form(""),
):
    if not len(_rotator):
        raise HTTPException(
            status_code=500,
            detail="Chưa cấu hình GEMINI_API_KEYS, GEMINI_API_KEY hoặc GOOGLE_API_KEY.",
        )

    # Decode ROI
    try:
        roi_bytes = base64.b64decode(roi_b64)
        nparr = np.frombuffer(roi_bytes, np.uint8)
        roi = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception:
        raise HTTPException(status_code=400, detail="ROI image không hợp lệ.")
    if roi is None:
        raise HTTPException(status_code=400, detail="Không thể đọc ROI image.")

    hand_label = _HAND_VI.get(_EXPECTED_HAND.get(gender, "Left"), "tay trái")
    full_question = f"Đây là {hand_label} của người {gender}."
    if extra_question.strip():
        full_question += f" {extra_question.strip()}"

    # Try every key up to 2 rounds
    max_attempts = len(_rotator) * 2
    last_msg = ""

    for attempt in range(max_attempts):
        key = _rotator.current()
        try:
            result = read_palm(
                image_bgr=roi,
                api_key=key,
                use_rag=True,
                extra_question=full_question,
            )
            return {"success": True, "result": result}

        except Exception as e:
            last_msg = str(e)
            print(f"[attempt {attempt+1}] key_idx={_rotator._idx}: {last_msg[:120]}")

            if _is_fatal(last_msg):
                raise HTTPException(status_code=503, detail=f"Tài khoản API bị khóa: {last_msg[:200]}")

            if _should_rotate(last_msg):
                _rotator.rotate()
                continue

            if _is_retryable(last_msg):
                await asyncio.sleep(3)
                _rotator.rotate()
                continue

            raise HTTPException(status_code=502, detail=f"Lỗi API: {last_msg}")

    raise HTTPException(
        status_code=503,
        detail=f"Tất cả API key đều thất bại. Lỗi cuối: {last_msg[:300]}",
    )
