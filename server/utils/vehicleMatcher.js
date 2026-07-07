const suitableVehicleTypes = {
  small: ["bike", "van"],
  medium: ["van", "pickup"],
  large: ["pickup", "truck"],
  bulk: ["truck"],
};

const getSuitableVehicleTypes = (packageSize) => {
  return suitableVehicleTypes[packageSize] || [];
};

module.exports = {
  getSuitableVehicleTypes,
};
