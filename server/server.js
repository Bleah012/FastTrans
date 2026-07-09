const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("FastTrans server is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FastTrans API is healthy",
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  connectDB();

  app.listen(PORT, () => {
    console.log(`FastTrans server running on port ${PORT}`);
  });
}

module.exports = app;