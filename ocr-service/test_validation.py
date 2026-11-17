
from gemini_service import InvoiceData
from validation import validate_invoice

# Create a sample invoice with valid data
invoice = InvoiceData(
    vendor_name="Acme Corporation",
    invoice_number="INV-10024",
    invoice_date="2026-11-14",
    due_date="2026-11-28",
    customer_name="ABC Technologies Inc.",
    subtotal=3100.0,
    tax=403.0,
    total=3503.0,
    currency="CAD"
)

# Run invoice validation
result = validate_invoice(invoice)

print("\nInvoice Validation Result:\n")
print(result)
