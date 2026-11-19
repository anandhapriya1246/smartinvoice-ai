
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
   {
    vendor_name: {
    type: String,
    trim: true,
    default: null
  },

    invoice_number: {
      type: String,
      required: true,
      trim: true
    },

    invoice_date: {
      type: String,
      required: true
    },

    due_date: {
      type: String,
      default: null
    },

    customer_name: {
      type: String,
      required: true,
      trim: true
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    tax: {
      type: Number,
      required: true,
      min: 0
    },

    total: {
      type: Number,
      default: null
    },

    currency: {
      type: String,
      default: null
    },

    validation: {
      is_valid: {
        type: Boolean,
        required: true
      },

      status: {
        type: String,
        enum: ["valid", "invalid"],
        required: true
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
