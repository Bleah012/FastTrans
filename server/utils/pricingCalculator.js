const packageCharges = {
  small: 0,
  medium: 300,
  large: 600,
  bulk: 1000,
};

const vehicleCharges = {
  bike: 0,
  van: 300,
  pickup: 600,
  truck: 1000,
};

const calculatePrice = (distance, packageSize, vehicleType) => {
  const baseFare = 500;
  const pricePerKm = 80;
  const packageCharge = packageCharges[packageSize] || 0;
  const vehicleCharge = vehicleCharges[vehicleType] || 0;

  return Math.round(baseFare + distance * pricePerKm + packageCharge + vehicleCharge);
};

module.exports = {
  calculatePrice,
};
