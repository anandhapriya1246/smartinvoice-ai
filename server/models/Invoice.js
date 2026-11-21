
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    // Original uploaded file information
    original_filename: {
      type: String,
      required: true,
      trim: true
    },

    saved_filename: {
      type: String,
      required: true,
      trim: true
    },

    size_bytes: {
      type: Number,
      required: true
    },

    // OCR extracted text
    extracted_text: {
      type: [String],
      default: []
    },

    // Invoice information extracted by Gemini
    vendor_name: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },

    invoice_number: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },

    invoice_date: {
      type: String,
      default: null
    },

    due_date: {
      type: String,
      default: null
    },

    customer_name: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },

    subtotal: {
      type: Number,
      default: null
    },

    tax: {
      type: Number,
      default: null
    },

    total: {
      type: Number,
      default: null
    },

    currency: {
      type: String,
      default: null
    },

    // Processing status
    processing_status: {
      type: String,
      enum: ["completed", "processing_failed"],
      required: true
    },

    // Invoice validation results
    validation: {
      is_valid: Boolean,

      status: {
        type: String,
        enum: ["valid", "invalid"]
      },

      errors: {
        type: [String],
        default: []
      },

      error_count: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate invoices using business details
invoiceSchema.index(
  {
    vendor_name: 1,
    invoice_number: 1,
    customer_name: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      vendor_name: { $type: "string" },
      invoice_number: { $type: "string" },
      customer_name: { $type: "string" }
    }
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
