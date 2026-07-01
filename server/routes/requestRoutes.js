const express = require("express");

const router = express.Router();

// Temporary in-memory storage for submitted transport requests.
const transportRequests = [];

// This route receives a new client transport request.
router.post("/", (req, res) => {
  const {
    pickupLocation,
    destination,
    packageType,
    weight,
    pickupDate,
    pickupTime,
    instructions,
  } = req.body;

  if (
    !pickupLocation ||
    !destination ||
    !weight ||
    !pickupDate ||
    !pickupTime
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required request details.",
    });
  }

  const newRequest = {
    id: Date.now().toString(),
    pickupLocation,
    destination,
    packageType,
    weight,
    pickupDate,
    pickupTime,
    instructions,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  transportRequests.push(newRequest);

  return res.status(201).json({
    success: true,
    message: "Transport request submitted successfully.",
    data: newRequest,
  });
});

// This route returns all submitted client transport requests.
router.get("/", (req, res) => {
  return res.json({
    success: true,
    count: transportRequests.length,
    data: transportRequests,
  });
});

module.exports = router;
