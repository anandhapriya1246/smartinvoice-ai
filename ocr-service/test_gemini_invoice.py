
from ocr import extract_text
from gemini_service import extract_invoice_data

# Path to the invoice image already uploaded
image_path = "uploads/98db73c5-242b-4cfd-9f6a-af3e19700ce7.png"

# Step 1: Extract text using PaddleOCR
ocr_text = extract_text(image_path)

print("\nOCR extraction completed!")

# Step 2: Send OCR text to Gemini
invoice_data = extract_invoice_data(ocr_text)

# Step 3: Display structured invoice data
print("\nStructured Invoice Data:\n")
print(invoice_data.model_dump_json(indent=2))
