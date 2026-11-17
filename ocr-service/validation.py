from datetime import datetime
from decimal import Decimal, InvalidOperation

def validate_required_fields(invoice):
    """
    Check whether required invoice fields are present.
    """

    required_fields = [
        "vendor_name",
        "invoice_number",
        "invoice_date",
        "customer_name",
        "subtotal",
        "tax",
        "total"
    ]

    missing_fields = []

    for field in required_fields:
        value = getattr(invoice, field, None)

        if value is None or (
            isinstance(value, str) and not value.strip()
        ):
            missing_fields.append(field)

    return missing_fields



def validate_amounts(invoice):
    """
    Check whether invoice amounts are valid.
    """

    amount_fields = ["subtotal", "tax", "total"]
    errors = []

    for field in amount_fields:
        value = getattr(invoice, field, None)

        # Skip unavailable optional amounts
        if value is None:
            continue

        try:
            amount = Decimal(str(value))

            # Check for NaN or infinity
            if not amount.is_finite():
                errors.append(f"{field} must be a finite number")
                continue

            # Check for negative amounts
            if amount < 0:
                errors.append(f"{field} cannot be negative")

        except (InvalidOperation, ValueError, TypeError):
            errors.append(f"{field} must be a valid number")

    return errors


def validate_invoice_total(invoice):
    """
    Check whether subtotal + tax equals the invoice total.
    """

    subtotal = invoice.subtotal
    tax = invoice.tax
    total = invoice.total

    # Skip calculation if required amounts are unavailable
    if subtotal is None or tax is None or total is None:
        return []

    try:
        subtotal = Decimal(str(subtotal))
        tax = Decimal(str(tax))
        total = Decimal(str(total))

        # Ensure all amounts are finite
        if not all(value.is_finite() for value in [subtotal, tax, total]):
            return []

        calculated_total = subtotal + tax

        if abs(calculated_total - total) > Decimal("0.01"):
            return [
                "Invoice total does not match subtotal + tax"
            ]

    except (InvalidOperation, ValueError, TypeError):
        # Invalid amounts are reported by validate_amounts()
        return []

    return []


def validate_invoice_dates(invoice):
    """
    Validate invoice date and due date.
    """

    errors = []

    invoice_date = None
    due_date = None

    # Validate invoice date
    if invoice.invoice_date:
        try:
            invoice_date = datetime.strptime(
                invoice.invoice_date, "%Y-%m-%d"
            )

            # Ensure exact YYYY-MM-DD format
            if invoice_date.strftime("%Y-%m-%d") != invoice.invoice_date:
                errors.append("Invoice date must use YYYY-MM-DD format")
                invoice_date = None

        except (ValueError, TypeError):
            errors.append("Invalid invoice date")

    # Validate due date
    if invoice.due_date:
        try:
            due_date = datetime.strptime(
                invoice.due_date, "%Y-%m-%d"
            )

            if due_date.strftime("%Y-%m-%d") != invoice.due_date:
                errors.append("Due date must use YYYY-MM-DD format")
                due_date = None

        except (ValueError, TypeError):
            errors.append("Invalid due date")

    # Compare dates only if both are valid
    if invoice_date and due_date:
        if due_date < invoice_date:
            errors.append(
                "Due date cannot be earlier than invoice date"
            )

    return errors


def validate_invoice(invoice):
    """
    Run all invoice validation checks.
    """

    errors = []

    errors.extend(validate_required_fields(invoice))
    errors.extend(validate_amounts(invoice))
    errors.extend(validate_invoice_total(invoice))
    errors.extend(validate_invoice_dates(invoice))

    return {
        "is_valid": len(errors) == 0,
        "status": "valid" if len(errors) == 0 else "invalid",
        "errors": errors,
        "error_count": len(errors)
    }
