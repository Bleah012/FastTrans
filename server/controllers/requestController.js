const Request = require("../models/Request");

// Creates a new transport request and saves it permanently in MongoDB.
const createRequest = async (req, res) => {
  try {
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
      !packageType ||
      !weight ||
      !pickupDate ||
      !pickupTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required request fields.",
      });
    }

    const request = await Request.create({
      pickupLocation,
      destination,
      packageType,
      weight: Number(weight),
      pickupDate,
      pickupTime,
      instructions,
    });

    return res.status(201).json({
      success: true,
      message: "Transport request created successfully.",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create transport request.",
      error: error.message,
    });
  }
};

// Gets all transport requests from MongoDB.
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transport requests.",
      error: error.message,
    });
  }
};

// Updates the status of a transport request.
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status.",
      });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Transport request not found.",
      });
    }

    return res.json({
      success: true,
      message: "Transport request status updated successfully.",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update transport request status.",
      error: error.message,
    });
  }
};

// Deletes a transport request from MongoDB.
const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Transport request not found.",
      });
    }

    return res.json({
      success: true,
      message: "Transport request deleted successfully.",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete transport request.",
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequestStatus,
  deleteRequest,
};
