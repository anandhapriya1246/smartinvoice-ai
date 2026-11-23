const cors = require("cors");

const express = require("express");

require("dotenv").config();

const connectDB = require("./config/db");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/invoices", invoiceRoutes);

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

