"""
app.py - Streamlit UI for the palm reading prototype
Run: streamlit run app.py
"""

import sys
import cv2
import numpy as np
import streamlit as st
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from preprocess import preprocess_palm
from palm_reader import read_palm

import os
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")

st.set_page_config(
    page_title="Palm Reader AI",
    page_icon="✋",
    layout="centered",
)

st.title("✋ Đọc Chỉ Tay AI")

# ── Sidebar ───────────────────────────────────────────────────────────────────
use_rag = True

with st.sidebar:
    st.header("Hướng dẫn")
    st.markdown(
        "1. Chọn giới tính để biết tay nào cần xem\n"
        "2. Đưa đúng tay, lòng bàn tay **ngửa lên**, ánh sáng tốt\n"
        "3. Upload ảnh hoặc chụp trực tiếp\n"
        "4. Nhấn **Đọc chỉ tay**\n"
    )

# ── Thông báo tay xem ─────────────────────────────────────────────────────────
st.info(
    "**Theo quan niệm chiêm tinh học:**\n\n"
    "- **Nam giới** xem **tay trái** (tay bẩm sinh — số phận định sẵn)\n"
    "- **Nữ giới** xem **tay phải** (tay bẩm sinh — số phận định sẵn)\n\n"
    "_Tay còn lại thể hiện những gì bạn đã thay đổi qua nỗ lực và kinh nghiệm sống._"
)

gender = st.radio(
    "Giới tính của bạn:",
    options=["Nam (xem tay trái)", "Nữ (xem tay phải)"],
    horizontal=True,
)
gender_label = "Nam" if gender.startswith("Nam") else "Nữ"
hand_label = "tay trái" if gender_label == "Nam" else "tay phải"

st.success(f"Vui lòng đưa **{hand_label}** vào camera, lòng bàn tay ngửa lên.")

st.markdown("---")

# ── Chọn phương thức nhập ảnh ─────────────────────────────────────────────────
tab_upload, tab_camera = st.tabs(["📁 Tải ảnh lên", "📷 Chụp trực tiếp"])

img_bgr = None

with tab_upload:
    uploaded = st.file_uploader(
        f"Chọn ảnh {hand_label} của bạn",
        type=["jpg", "jpeg", "png"],
        help=f"Ảnh {hand_label} ngửa lên, lòng bàn tay nhìn thẳng vào camera",
    )
    if uploaded:
        file_bytes = np.frombuffer(uploaded.read(), np.uint8)
        img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

with tab_camera:
    st.markdown(f"Hướng **{hand_label}** vào camera, giữ nguyên và nhấn chụp.")
    camera_photo = st.camera_input(f"Chụp {hand_label}")
    if camera_photo:
        file_bytes = np.frombuffer(camera_photo.read(), np.uint8)
        img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

# ── Câu hỏi bổ sung ───────────────────────────────────────────────────────────
extra_q = st.text_input(
    "Câu hỏi thêm (tùy chọn)",
    placeholder="Vd: Tôi có duyên kinh doanh không?",
)

# ── Xử lý & phân tích ─────────────────────────────────────────────────────────
if img_bgr is not None:
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Ảnh gốc")
        st.image(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB), use_container_width=True)

    with st.spinner("Đang cắt và cải thiện ảnh lòng bàn tay..."):
        roi, msg, _ = preprocess_palm(img_bgr)

    if roi is None:
        st.error(f"Không phát hiện bàn tay: {msg}. Hãy thử lại với ảnh rõ hơn.")
    else:
        with col2:
            st.subheader("ROI đã xử lý")
            st.image(cv2.cvtColor(roi, cv2.COLOR_BGR2RGB), use_container_width=True)

        if st.button(" Đọc chỉ tay", type="primary", use_container_width=True):
            full_question = f"Đây là {hand_label} của người {gender_label}. " + extra_q
            with st.spinner("Đang phân tích chỉ tay... (có thể mất 10-20 giây)"):
                try:
                    result = read_palm(
                        image_bgr=roi,
                        api_key=GEMINI_API_KEY,
                        use_rag=use_rag,
                        extra_question=full_question,
                    )
                    st.markdown("---")
                    st.subheader(" Kết quả đọc chỉ tay")
                    st.markdown(result)
                except Exception as e:
                    st.error(f"Lỗi khi gọi Gemini API: {e}")

st.markdown("---")
st.caption(
    "⚠️ Đây là ứng dụng giải trí và tham khảo. "
    "Kết quả không phải lời khuyên y tế, tài chính hay pháp lý."
)
