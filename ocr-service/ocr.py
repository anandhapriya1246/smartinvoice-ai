
from paddleocr import PaddleOCR

# Initialize OCR engine
ocr_engine = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    enable_mkldnn=False
)


def extract_text(image_path: str):
    """
    Extract text from an invoice image using PaddleOCR.
    """

    results = ocr_engine.predict(input=image_path)

    extracted_text = []

    for result in results:
        result_data = result.json
        data = result_data.get("res", result_data)

        texts = data.get("rec_texts", [])
        extracted_text.extend(texts)

    return extracted_text
