require("dotenv").config();
const express = require("express");
const cors = require("cors");
const landRoutes = require("./routes/land");
const { startEventListeners } = require("./services/blockchain");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/land", landRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "TerraBlock backend is running" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`TerraBlock backend running on port ${PORT}`);

  // Start listening to blockchain events
  try {
    startEventListeners();
    console.log("Blockchain event listeners started");
  } catch (error) {
    console.warn("Could not start event listeners:", error.message);
  }
});

