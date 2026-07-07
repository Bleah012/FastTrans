const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const minutesInDay = 24 * 60;
  const normalizedMinutes = ((minutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalizedMinutes / 60);
  const remainingMinutes = normalizedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
};

const estimateDuration = (distance) => {
  const averageSpeedKmPerHour = 40;
  return Math.round((distance / averageSpeedKmPerHour) * 60);
};

const calculateEndTime = (startTime, durationMinutes) => {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes);
};

const checkTimeOverlap = (newStart, newEnd, existingStart, existingEnd) => {
  const newStartMinutes = timeToMinutes(newStart);
  const newEndMinutes = timeToMinutes(newEnd);
  const existingStartMinutes = timeToMinutes(existingStart);
  const existingEndMinutes = timeToMinutes(existingEnd);

  return newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  estimateDuration,
  calculateEndTime,
  checkTimeOverlap,
};
