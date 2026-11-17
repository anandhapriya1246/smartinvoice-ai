
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Initialize Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Define the invoice data structure
class InvoiceData(BaseModel):
    vendor_name: str | None
    invoice_number: str | None
    invoice_date: str | None
    due_date: str | None
    customer_name: str | None
    subtotal: float | None
    tax: float | None
    total: float | None
    currency: str | None


def extract_invoice_data(ocr_text: list[str]):
    """
    Convert OCR text into structured invoice data using Gemini.
    """

    text = "\n".join(ocr_text)

    prompt = f"""
    You are an invoice data extraction assistant.

    Extract the invoice information from the following OCR text.

    Rules:
    - Extract only information present in the text.
    - Do not invent missing values.
    - Use null when a field is unavailable.
    - Return dates in YYYY-MM-DD format.
    - Return monetary values as numbers.
    - Do not calculate or guess missing amounts.

    OCR TEXT:
    {text}
    """

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=InvoiceData
        )
    )

    return response.parsed
