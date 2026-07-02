const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    clientName: {
      type: String,
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    pickupLocation: {
      type: String,
      required: [true, "Pickup location is required."],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required."],
      trim: true,
    },
    packageType: {
      type: String,
      required: [true, "Package type is required."],
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, "Package weight is required."],
      min: [1, "Weight must be greater than 0."],
    },
    pickupDate: {
      type: String,
      required: [true, "Pickup date is required."],
    },
    pickupTime: {
      type: String,
      required: [true, "Pickup time is required."],
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        return returnedObject;
      },
    },
  },
);

module.exports = mongoose.model("Request", requestSchema);
