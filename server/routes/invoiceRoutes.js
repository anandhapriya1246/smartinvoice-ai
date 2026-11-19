
const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

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

    return res.status(200).json(result);

  } catch (error) {
    console.error("Invoice processing error:", error);

    return res.status(500).json({
      message: "Failed to communicate with Python OCR service."
    });
  }
});

module.exports = router;


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
