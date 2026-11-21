
const express = require("express");
const multer = require("multer");
const Invoice = require("../models/Invoice");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Normalize text before saving invoice details
const normalizeText = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim().replace(/\s+/g, " ").toLowerCase();
};

// Test invoice route
router.get("/", (req, res) => {
  res.json({
    message: "Invoice API is working!"
  });
});

// Forward invoice to Python OCR service

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an invoice file."
      });
    }

    // Forward invoice to Python OCR service
    const formData = new FormData();

    const fileBlob = new Blob([req.file.buffer], {
      type: req.file.mimetype
    });

    formData.append("file", fileBlob, req.file.originalname);

    const pythonResponse = await fetch(
      "http://localhost:8000/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const result = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return res.status(pythonResponse.status).json(result);
    }

    // Get structured invoice data, if Gemini succeeded
    const invoiceData = result.invoice_data || {};

    // Create a new invoice document
    const invoice = new Invoice({
      original_filename: result.original_filename,
      saved_filename: result.saved_filename,
      size_bytes: result.size_bytes,
      extracted_text: result.extracted_text,

      vendor_name: normalizeText(invoiceData.vendor_name),
      invoice_number: normalizeText(invoiceData.invoice_number),
      invoice_date: invoiceData.invoice_date,
      due_date: invoiceData.due_date,
      customer_name: normalizeText(invoiceData.customer_name),
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      total: invoiceData.total,
      currency: invoiceData.currency,

      processing_status: result.processing_status,
      validation: result.validation || undefined
    });

    // Check for an existing invoice
if (
  invoice.vendor_name &&
  invoice.invoice_number &&
  invoice.customer_name
) {
  const existingInvoice = await Invoice.findOne({
    vendor_name: invoice.vendor_name,
    invoice_number: invoice.invoice_number,
    customer_name: invoice.customer_name
  });

  if (existingInvoice) {
    return res.status(409).json({
      message: "Duplicate invoice detected!",
      existing_invoice_id: existingInvoice._id
    });
  }
}

// Save invoice in MongoDB
    await invoice.save();
    return res.status(201).json({
      message: "Invoice uploaded and saved successfully!",
      invoice
    });

  } catch (error) {
    console.error("Invoice processing error:", error);

    // Handle duplicate invoice
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This invoice already exists."
      });
    }

    return res.status(500).json({
      message: "Failed to process or save invoice."
    });
  }
});



// Test invoice route
router.get("/", (req, res) => {
  res.json({
    message: "Invoice API is working!"
  });
});

// Invoice upload route
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please upload an invoice file."
    });
  }

  res.json({
    message: "Invoice file received successfully!",
    original_filename: req.file.originalname,
    file_size: req.file.size
  });
});

module.exports = router;
