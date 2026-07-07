const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "van", "pickup", "truck"],
      required: true,
    },
    capacitySize: {
      type: String,
      enum: ["small", "medium", "large", "bulk"],
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "unavailable", "maintenance"],
      default: "available",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
