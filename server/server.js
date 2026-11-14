const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.send("SmartInvoice AI Backend is running!");
});

// Start server after MongoDB connects
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

