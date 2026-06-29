"""
palm_reader.py - Sends palm ROI to Gemini vision
"""

import base64
import json
import os
import textwrap
import urllib.error
import urllib.request

import cv2
import numpy as np

from rag import retrieve

_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
_MAX_OUTPUT_TOKENS = int(os.environ.get("GEMINI_MAX_OUTPUT_TOKENS", "4096"))
_MAX_CONTINUATIONS = int(os.environ.get("GEMINI_MAX_CONTINUATIONS", "2"))


def _model_candidates() -> list[str]:
    primary = os.environ.get("GEMINI_MODEL", _MODEL).strip() or _MODEL
    fallbacks_raw = os.environ.get("GEMINI_FALLBACK_MODELS", "gemini-2.5-flash")
    models: list[str] = []
    for name in [primary, *fallbacks_raw.split(",")]:
        model = name.strip()
        if model and model not in models:
            models.append(model)
    return models


def _looks_truncated(text: str) -> bool:
    tail = text.rstrip()
    if not tail:
        return False
    if tail.endswith(("...", "…")):
        return True
    if tail[-1].isalnum():
        return True
    return False


def _extract_text_and_finish_reason(body: dict) -> tuple[str, str]:
    parts_out: list[str] = []
    finish_reason = ""

    for candidate in body.get("candidates", []):
        finish_reason = candidate.get("finishReason", finish_reason)
        content = candidate.get("content", {})
        for part in content.get("parts", []):
            text = part.get("text")
            if text:
                parts_out.append(text)

    return "\n".join(parts_out).strip(), finish_reason

_SYSTEM_PROMPT = textwrap.dedent("""
    Bạn là chuyên gia chiêm tinh và đọc chỉ tay (palmistry) có nhiều kinh nghiệm.
    Khi nhận được ảnh lòng bàn tay, hãy:
    1. Mô tả ngắn gọn những gì bạn quan sát thấy trên bàn tay (đường nét, gò, hình dạng).
    2. Phân tích các đường chỉ tay chính: Sinh Đạo, Trí Đạo, Tâm Đạo (và Vận Mệnh nếu thấy).
    3. Đưa ra tiên đoán và lời khuyên dựa trên đặc điểm quan sát.
    4. Trình bày rõ ràng, dễ hiểu, mang tính xây dựng và tích cực.
    5. Dùng kiến thức chiêm tinh học phương Đông lẫn phương Tây.
    Luôn trả lời bằng tiếng Việt, trừ khi người dùng yêu cầu ngôn ngữ khác.
    Nhắc nhở nhẹ nhàng rằng đây là tham khảo vui, không phải dự báo tuyệt đối.
""").strip()


def read_palm(
    image_bgr: np.ndarray,
    api_key: str,
    use_rag: bool = True,
    extra_question: str = "",
) -> str:
    if not api_key:
        raise ValueError("Thiếu GEMINI_API_KEY hoặc GOOGLE_API_KEY.")

    # Encode image to base64
    _, buf = cv2.imencode(".jpg", image_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    b64 = base64.b64encode(buf.tobytes()).decode()

    # Build prompt
    parts = ["Đây là ảnh lòng bàn tay đã được xử lý. Hãy đọc và phân tích chỉ tay."]

    if use_rag:
        query = extra_question if extra_question else "đường sinh đạo trí đạo tâm đạo vận mệnh"
        context = retrieve(query)
        if context:
            parts.append(f"\n\n## Kiến thức tham khảo (palmistry):\n{context}")

    if extra_question:
        parts.append(f"\n\nCâu hỏi bổ sung từ người dùng: {extra_question}")

    prompt_text = "\n".join(parts)
    last_error = ""

    for model_name in _model_candidates():
        contents = [
            {
                "role": "user",
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": b64,
                        },
                    },
                    {"text": prompt_text},
                ],
            }
        ]
        chunks: list[str] = []

        for turn in range(_MAX_CONTINUATIONS + 1):
            payload = {
                "systemInstruction": {
                    "parts": [{"text": _SYSTEM_PROMPT}],
                },
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.9,
                    "maxOutputTokens": _MAX_OUTPUT_TOKENS,
                    "responseMimeType": "text/plain",
                },
            }

            req = urllib.request.Request(
                url=f"{_BASE_URL}/{model_name}:generateContent?key={api_key}",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                },
                method="POST",
            )

            try:
                with urllib.request.urlopen(req, timeout=90) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError as exc:
                raw = exc.read().decode("utf-8", errors="replace")
                try:
                    detail = json.loads(raw)
                except json.JSONDecodeError:
                    detail = raw
                last_error = f"{model_name}: Gemini API HTTP {exc.code}: {detail}"

                if exc.code == 503:
                    break
                raise RuntimeError(last_error) from exc
            except urllib.error.URLError as exc:
                raise RuntimeError(f"Không kết nối được Gemini API: {exc.reason}") from exc

            text, finish_reason = _extract_text_and_finish_reason(body)
            if text:
                chunks.append(text)

                should_continue = (
                    finish_reason == "MAX_TOKENS"
                    or (turn < _MAX_CONTINUATIONS and _looks_truncated(text))
                )
                if not should_continue:
                    return "\n".join(chunks).strip()

                contents.extend([
                    {
                        "role": "model",
                        "parts": [{"text": text}],
                    },
                    {
                        "role": "user",
                        "parts": [{
                            "text": (
                                "Tiếp tục đúng phần còn dang dở ngay từ chỗ vừa dừng. "
                                "Không lặp lại nội dung đã viết, không mở đầu lại."
                            )
                        }],
                    },
                ])
                continue

            prompt_feedback = body.get("promptFeedback")
            if prompt_feedback:
                last_error = f"{model_name}: Gemini không trả nội dung: {prompt_feedback}"
                break

            last_error = f"{model_name}: Gemini trả về payload không có text: {body}"
            break

        if chunks:
            return "\n".join(chunks).strip()

    raise RuntimeError(last_error or "Gemini thất bại với mọi model đã cấu hình.")
