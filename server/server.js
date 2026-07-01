const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FastTrans server is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FastTrans API is healthy",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FastTrans server running on port ${PORT}`);
});
