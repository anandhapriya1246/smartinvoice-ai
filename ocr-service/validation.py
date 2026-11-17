from datetime import datetime
def validate_required_fields(invoice):
    """
    Check whether required invoice fields are present.
    """

    required_fields = [
        "vendor_name",
        "invoice_number",
        "invoice_date",
        "customer_name",
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

        if value is not None and value < 0:
            errors.append(f"{field} cannot be negative")

    return errors


from decimal import Decimal

def validate_invoice_total(invoice):
    """
    Check whether subtotal + tax equals the invoice total.
    """

    subtotal = invoice.subtotal
    tax = invoice.tax
    total = invoice.total

    # Skip calculation if any required amount is unavailable
    if subtotal is None or tax is None or total is None:
        return []

    calculated_total = (
        Decimal(str(subtotal)) + Decimal(str(tax))
    )

    actual_total = Decimal(str(total))

    if abs(calculated_total - actual_total) > Decimal("0.01"):
        return [
            "Invoice total does not match subtotal + tax"
        ]

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
        except ValueError:
            errors.append("Invalid invoice date format")

    # Validate due date
    if invoice.due_date:
        try:
            due_date = datetime.strptime(
                invoice.due_date, "%Y-%m-%d"
            )
        except ValueError:
            errors.append("Invalid due date format")

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
        "errors": errors
    }
