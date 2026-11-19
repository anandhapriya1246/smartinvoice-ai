
import logging
import uuid

from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool

from ocr import extract_text
from gemini_service import extract_invoice_data
from validation import validate_invoice


# Configure logging
logger = logging.getLogger(__name__)


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
        await file.close()

        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG and PNG files are allowed"
        )

    # Read uploaded file
    content = await file.read()
    await file.close()

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must not exceed 10 MB"
        )

    # Check whether file is empty
    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    # Generate a unique filename
    unique_filename = f"{uuid.uuid4()}{extension}"

    file_path = UPLOAD_DIR / unique_filename

    # Save uploaded file
    file_path.write_bytes(content)

    # Extract text using PaddleOCR
    try:
        extracted_text = await run_in_threadpool(
            extract_text,
            str(file_path)
        )

        # Check whether OCR extracted any text
        if not extracted_text:
            raise HTTPException(
                status_code=422,
                detail="No text could be extracted from the uploaded invoice"
            )

    except Exception:
        # Remove uploaded file if OCR processing fails
        file_path.unlink(missing_ok=True)
        raise

    # Initialize processing results
    invoice_data = None
    validation_result = None
    processing_status = "completed"

    # Extract structured invoice data using Gemini
    try:
        invoice_data = await run_in_threadpool(
            extract_invoice_data,
            extracted_text
        )

        if invoice_data is None:
            raise ValueError("Gemini returned no invoice data")

        # Validate extracted invoice data
        validation_result = validate_invoice(invoice_data)

    except Exception:
        logger.exception("Gemini invoice extraction failed")

        # Preserve uploaded file and OCR text
        processing_status = "processing_failed"

    # Return processing results
    return {
        "message": "Invoice uploaded successfully!",
        "original_filename": file.filename,
        "saved_filename": unique_filename,
        "size_bytes": len(content),
        "extracted_text": extracted_text,
        "invoice_data": (
            invoice_data.model_dump()
            if invoice_data is not None
            else None
        ),
        "validation": validation_result,
        "processing_status": processing_status
    }
