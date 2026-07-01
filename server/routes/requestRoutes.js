const express = require("express");

const router = express.Router();

const allowedStatuses = [
  "pending",
  "approved",
  "assigned",
  "completed",
  "cancelled",
];

const transportRequests = [];

// Creates a new transport request and stores it temporarily in server memory.
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
      message: "Pickup, destination, weight, date, and time are required.",
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
    message: "Transport request created successfully.",
    data: newRequest,
  });
});

// Returns all transport requests currently stored in server memory.
router.get("/", (req, res) => {
  return res.json({
    success: true,
    count: transportRequests.length,
    data: transportRequests,
  });
});

// Updates the status of one transport request.
router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request status.",
    });
  }

  const request = transportRequests.find(
    (transportRequest) => transportRequest.id === id,
  );

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Transport request not found.",
    });
  }

  request.status = status;
  request.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: "Transport request status updated successfully.",
    data: request,
  });
});

module.exports = router;
