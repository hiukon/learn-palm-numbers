"""
preprocess.py - Palm ROI extraction
Pipeline: MediaPipe landmark detection → centroid crop → CLAHE enhancement
"""

from __future__ import annotations

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from pathlib import Path

MODEL_PATH = Path(__file__).parent.parent / "hand_landmarker.task"

_detector = None


def _get_detector():
    global _detector
    if _detector is None:
        base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            running_mode=vision.RunningMode.IMAGE,
        )
        _detector = vision.HandLandmarker.create_from_options(options)
    return _detector


def _apply_clahe(gray: np.ndarray) -> np.ndarray:
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(5, 5))
    return clahe.apply(gray)


def preprocess_palm(image_bgr: np.ndarray) -> tuple[np.ndarray | None, str]:
    """
    Extracts and enhances the palm ROI from an image.

    Returns:
        (roi_bgr, message) where roi_bgr is None on failure.
    """
    detector = _get_detector()

    img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
    result = detector.detect(mp_image)

    if not result.hand_landmarks:
        return None, "Không phát hiện bàn tay trong ảnh."

    h, w = image_bgr.shape[:2]
    lm = result.hand_landmarks[0]

    # Palm landmarks: wrist(0), thumb base(1,2), index MCP(5), middle MCP(9),
    # ring MCP(13), pinky MCP(17)
    palm_indices = [0, 1, 2, 5, 9, 13, 17]
    xs = [lm[i].x * w for i in palm_indices]
    ys = [lm[i].y * h for i in palm_indices]

    cx = int(np.mean(xs))
    cy = int(np.mean(ys))

    # Estimate palm size from wrist to middle MCP
    wrist_y = lm[0].y * h
    mid_mcp_y = lm[9].y * h
    palm_size = int(abs(wrist_y - mid_mcp_y) * 2.2)
    half = max(palm_size // 2, 80)

    x1 = max(0, cx - half)
    y1 = max(0, cy - half)
    x2 = min(w, cx + half)
    y2 = min(h, cy + half)

    roi = image_bgr[y1:y2, x1:x2]
    if roi.size == 0:
        return None, "ROI rỗng sau khi cắt."

    # CLAHE on L channel of LAB for colour-preserving enhancement
    lab = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l_clahe = _apply_clahe(l)
    enhanced = cv2.merge([l_clahe, a, b])
    roi_enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    roi_resized = cv2.resize(roi_enhanced, (512, 512), interpolation=cv2.INTER_LANCZOS4)
    return roi_resized, "OK"


def preprocess_from_path(image_path: str) -> tuple[np.ndarray | None, str]:
    img = cv2.imread(image_path)
    if img is None:
        return None, f"Không đọc được ảnh: {image_path}"
    return preprocess_palm(img)
