const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const requestRoutes = require("./routes/requestRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`FastTrans server running on port ${PORT}`);
});
