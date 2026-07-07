const Vehicle = require("../models/Vehicle");
const Schedule = require("../models/Schedule");
const { calculateDistance } = require("../utils/distanceCalculator");
const {
  estimateDuration,
  calculateEndTime,
  checkTimeOverlap,
} = require("../utils/timeHelper");
const { getSuitableVehicleTypes } = require("../utils/vehicleMatcher");
const { calculatePrice } = require("../utils/pricingCalculator");

// Checks route details against available vehicles and existing schedules.
const checkAvailability = async (req, res) => {
  try {
    const { packageSize, source, destination, transportDate, startTime } = req.body;

    if (!packageSize || !source || !destination || !transportDate || !startTime) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide package size, source, destination, transport date, and start time",
      });
    }

    const distance = calculateDistance(source, destination);
    const estimatedDuration = estimateDuration(distance);
    const endTime = calculateEndTime(startTime, estimatedDuration);
    const suitableVehicleTypes = getSuitableVehicleTypes(packageSize);
    const selectedDate = new Date(transportDate);

    if (suitableVehicleTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid package size",
      });
    }

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid transport date",
      });
    }

    const vehicles = await Vehicle.find({
      vehicleType: { $in: suitableVehicleTypes },
      availabilityStatus: "available",
    });

    if (vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No suitable vehicle type is currently available",
      });
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    let selectedVehicle = null;

    for (const vehicle of vehicles) {
      const schedules = await Schedule.find({
        vehicleId: vehicle._id,
        scheduleStatus: "scheduled",
        transportDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      const hasOverlap = schedules.some((schedule) =>
        checkTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime),
      );

      if (!hasOverlap) {
        selectedVehicle = vehicle;
        break;
      }
    }

    if (!selectedVehicle) {
      return res.status(404).json({
        success: false,
        message: "No suitable vehicle is available for the selected time",
      });
    }

    const estimatedPrice = calculatePrice(
      distance,
      packageSize,
      selectedVehicle.vehicleType,
    );

    // This response is intended for the Offer Management Module, which can use
    // the returned vehicle, distance, duration, and price to generate a transport offer.
    return res.status(200).json({
      success: true,
      message: "Suitable vehicle found",
      distance,
      estimatedDuration,
      startTime,
      endTime,
      estimatedPrice,
      vehicle: {
        vehicleId: selectedVehicle._id,
        vehicleName: selectedVehicle.vehicleName,
        registrationNumber: selectedVehicle.registrationNumber,
        vehicleType: selectedVehicle.vehicleType,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error while checking vehicle availability",
    });
  }
};

module.exports = {
  checkAvailability,
};
