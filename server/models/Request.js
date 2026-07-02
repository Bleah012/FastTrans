const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    packageType: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
    },
    pickupDate: {
      type: String,
      required: true,
    },
    pickupTime: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      default: "",
      trim: true,
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
      transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        return returnedObject;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
