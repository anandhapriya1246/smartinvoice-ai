from validation import validate_invoice
from ocr import extract_text
from gemini_service import extract_invoice_data
from fastapi.concurrency import run_in_threadpool
from fastapi import FastAPI, UploadFile, File, HTTPException
from pathlib import Path
import uuid

app = FastAPI(
    title="SmartInvoice OCR Service",
    description="Python service for invoice processing",
    version="1.0.0"
)

# Folder where uploaded invoices will be stored
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@app.get("/")
def home():
    return {
        "message": "SmartInvoice OCR Service is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/upload")
async def upload_invoice(file: UploadFile = File(...)):

    # Check file extension
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG and PNG files are allowed"
        )

    # Read uploaded file
    content = await file.read()

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must not exceed 10 MB"
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    # Generate a unique filename
    unique_filename = f"{uuid.uuid4()}{extension}"

    file_path = UPLOAD_DIR / unique_filename

    # Save file
    file_path.write_bytes(content)

    # Extract text using PaddleOCR
    extracted_text = await run_in_threadpool(
        extract_text,
        str(file_path)
    )

    # Convert OCR text into structured invoice data using Gemini
    invoice_data = await run_in_threadpool(
        extract_invoice_data,
        extracted_text
    )

    # Validate extracted invoice data
    validation_result = validate_invoice(invoice_data)
    await file.close()

    # Return OCR text and structured invoice data
    return {
        "message": "Invoice uploaded and processed successfully!",
        "original_filename": file.filename,
        "saved_filename": unique_filename,
        "size_bytes": len(content),
        "extracted_text": extracted_text,
        "invoice_data": invoice_data.model_dump(),
        "validation": validation_result
    }
