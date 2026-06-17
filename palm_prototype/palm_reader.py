"""
palm_reader.py - Sends palm ROI + palmistry context to Gemini (google-genai SDK)
"""

import textwrap
import cv2
import numpy as np
from google import genai
from google.genai import types
from rag import retrieve

_MODEL = "gemini-2.5-flash"

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
    client = genai.Client(api_key=api_key)

    # Encode image to JPEG bytes
    _, buf = cv2.imencode(".jpg", image_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    image_bytes = buf.tobytes()

    # Build prompt text
    prompt_parts = ["Đây là ảnh lòng bàn tay đã được xử lý. Hãy đọc và phân tích chỉ tay."]

    if use_rag:
        query = extra_question if extra_question else "đường sinh đạo trí đạo tâm đạo vận mệnh"
        context = retrieve(query)
        if context:
            prompt_parts.append(f"\n\n## Kiến thức tham khảo (palmistry):\n{context}")

    if extra_question:
        prompt_parts.append(f"\n\nCâu hỏi bổ sung từ người dùng: {extra_question}")

    prompt_text = "\n".join(prompt_parts)

    response = client.models.generate_content(
        model=_MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            prompt_text,
        ],
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_PROMPT,
        ),
    )

    return response.text
