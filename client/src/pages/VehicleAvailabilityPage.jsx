import { useEffect, useState } from "react";
import AdminAreaNotice, { hasAdminAccess } from "../components/AdminAreaNotice";

const defaultRouteData = {
  pickupLocation: "Nairobi, Kenya",
  destination: "Mombasa, Kenya",
  packageType: "General Goods",
  packageWeight: "25",
  pickupDate: "",
  pickupTime: "",
  sourceOfferId: "",
};

const bookingStorageKey = "fasttrans-vehicle-bookings";
const offerStorageKey = "fasttrans-generated-offers";

const knownRoutes = {
  "nairobi, kenya|mombasa, kenya": { distance: 485, duration: "7h 20m" },
  "nairobi, kenya|kisumu, kenya": { distance: 350, duration: "6h 10m" },
  "kisumu, kenya|nairobi, kenya": { distance: 350, duration: "6h 10m" },
  "mombasa, kenya|nairobi, kenya": { distance: 485, duration: "7h 20m" },
  "nairobi, kenya|nakuru, kenya": { distance: 160, duration: "3h 00m" },
};

const vehicles = [
  {
    id: "VH-001",
    type: "Pickup",
    plateNumber: "KDA 102A",
    capacityKg: 200,
    status: "available",
  },
  {
    id: "VH-002",
    type: "Van",
    plateNumber: "KDB 455B",
    capacityKg: 1000,
    status: "available",
  },
  {
    id: "VH-003",
    type: "Truck",
    plateNumber: "KDC 889C",
    capacityKg: 5000,
    status: "available",
  },
  {
    id: "VH-004",
    type: "Refrigerated Truck",
    plateNumber: "KDD 701D",
    capacityKg: 3000,
    status: "available",
  },
  {
    id: "VH-005",
    type: "Heavy Cargo Trailer",
    plateNumber: "KDE 240E",
    capacityKg: 12000,
    status: "maintenance",
  },
];

function VehicleAvailabilityPage() {
  const [routeData, setRouteData] = useState(defaultRouteData);
  const [routeResult, setRouteResult] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [acceptedOffers, setAcceptedOffers] = useState([]);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const canAccessAdminArea = hasAdminAccess();

  useEffect(() => {
    if (!canAccessAdminArea) {
      return;
    }

    const savedBookings =
      JSON.parse(localStorage.getItem(bookingStorageKey)) || [];
    const savedOffers = JSON.parse(localStorage.getItem(offerStorageKey)) || [];

    const readyOffers = savedOffers.filter(
      (offer) =>
        offer.status === "accepted" ||
        offer.schedulingStatus === "ready_for_scheduling",
    );

    setBookings(savedBookings);
    setAcceptedOffers(readyOffers);
  }, [canAccessAdminArea]);

  const getOfferValue = (offer, fieldName, fallback = "") => {
    return offer[fieldName] || offer.request?.[fieldName] || fallback;
  };

  const getOfferWeight = (offer) => {
    return (
      offer.weight ||
      offer.packageWeight ||
      offer.request?.weight ||
      offer.request?.packageWeight ||
      "25"
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setRouteData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setStatusMessage("");
    setStatusType("");
  };

  const handleLoadAcceptedOffer = (offer) => {
    setRouteData({
      pickupLocation: getOfferValue(offer, "pickupLocation"),
      destination: getOfferValue(offer, "destination"),
      packageType: getOfferValue(offer, "packageType", "General Goods"),
      packageWeight: getOfferWeight(offer),
      pickupDate: getOfferValue(offer, "pickupDate"),
      pickupTime: getOfferValue(offer, "pickupTime"),
      sourceOfferId: offer.id || "",
    });

    setRouteResult(null);
    setErrors({});
    setStatusMessage("Accepted offer loaded into route availability form.");
    setStatusType("success");
  };

  const validateRouteForm = () => {
    const newErrors = {};

    if (!routeData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required.";
    }

    if (!routeData.destination.trim()) {
      newErrors.destination = "Destination is required.";
    }

    if (!routeData.packageWeight || Number(routeData.packageWeight) <= 0) {
      newErrors.packageWeight = "Enter a valid package weight.";
    }

    if (!routeData.pickupDate) {
      newErrors.pickupDate = "Pickup date is required.";
    }

    if (!routeData.pickupTime) {
      newErrors.pickupTime = "Pickup time is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getRecommendedVehicle = () => {
    const weight = Number(routeData.packageWeight) || 0;

    if (routeData.packageType === "Perishable Goods")
      return "Refrigerated Truck";
    if (weight > 5000) return "Heavy Cargo Trailer";
    if (weight > 1000) return "Truck";
    if (weight > 200) return "Van";

    return "Pickup";
  };

  const handleCalculateRoute = () => {
    if (!validateRouteForm()) {
      setStatusMessage("Please fix the highlighted fields before calculating.");
      setStatusType("error");
      return;
    }

    const routeKey = `${routeData.pickupLocation.trim().toLowerCase()}|${routeData.destination
      .trim()
      .toLowerCase()}`;

    const knownRoute = knownRoutes[routeKey];
    const distance = knownRoute ? knownRoute.distance : 250;
    const duration = knownRoute ? knownRoute.duration : "4h 30m";

    setRouteResult({
      distance,
      duration,
      recommendedVehicle: getRecommendedVehicle(),
      routeLabel: `${routeData.pickupLocation} to ${routeData.destination}`,
    });

    setStatusMessage("Route calculated successfully.");
    setStatusType("success");
  };

  const isVehicleBookedForSchedule = (vehicleId) => {
    return bookings.some(
      (booking) =>
        booking.vehicleId === vehicleId &&
        booking.pickupDate === routeData.pickupDate &&
        booking.pickupTime === routeData.pickupTime,
    );
  };

  const isRecommendedVehicle = (vehicle) => {
    return routeResult && vehicle.type === routeResult.recommendedVehicle;
  };

  const handleBookVehicle = (vehicle) => {
    if (!routeResult) {
      setStatusMessage("Calculate the route before booking a vehicle.");
      setStatusType("error");
      return;
    }

    if (vehicle.status !== "available") {
      setStatusMessage("This vehicle is not available for booking.");
      setStatusType("error");
      return;
    }

    if (isVehicleBookedForSchedule(vehicle.id)) {
      setStatusMessage(
        "This vehicle is already booked for that date and time.",
      );
      setStatusType("error");
      return;
    }

    const newBooking = {
      id: Date.now().toString(),
      sourceOfferId: routeData.sourceOfferId,
      vehicleId: vehicle.id,
      vehicleType: vehicle.type,
      plateNumber: vehicle.plateNumber,
      pickupLocation: routeData.pickupLocation,
      destination: routeData.destination,
      packageType: routeData.packageType,
      packageWeight: routeData.packageWeight,
      pickupDate: routeData.pickupDate,
      pickupTime: routeData.pickupTime,
      distance: routeResult.distance,
      duration: routeResult.duration,
      status: "booked",
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [newBooking, ...bookings];

    setBookings(updatedBookings);
    localStorage.setItem(bookingStorageKey, JSON.stringify(updatedBookings));

    setStatusMessage(
      `${vehicle.type} ${vehicle.plateNumber} booked successfully.`,
    );
    setStatusType("success");
  };

  const getVehicleStatusClass = (status) => {
    if (status === "available") return "bg-emerald-50 text-emerald-700";
    if (status === "booked") return "bg-amber-50 text-amber-700";

    return "bg-red-50 text-red-700";
  };

  if (!canAccessAdminArea) {
    return (
      <main className="px-6 py-8 text-slate-950">
        <section className="mx-auto max-w-7xl">
          <AdminAreaNotice
            title="Vehicle Availability Access"
            description="Login as an admin or manager before assigning vehicles or changing availability decisions."
          />
        </section>
      </main>
    );
  }

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <AdminAreaNotice
          title="Vehicle Availability Access"
          description="Login as an admin or manager before assigning vehicles or changing availability decisions."
        />

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Nathaniel Module
          </p>
          <h2 className="mt-1 text-3xl font-bold">
            Route and Vehicle Availability
          </h2>
          <p className="mt-1 text-slate-600">
            Calculate distance, estimate duration, match vehicles, and prevent
            double booking.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`mb-6 rounded-md px-4 py-3 text-sm font-medium ${
              statusType === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <section className="mb-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-bold">
              Accepted Offers Ready for Availability Check
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Load accepted client offers from Amanda's module into Nathaniel's
              vehicle availability check.
            </p>
          </div>

          {acceptedOffers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Offer
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Route
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Package
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Schedule
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {acceptedOffers.map((offer, index) => (
                    <tr key={offer.id || index} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-6 py-4 font-semibold">
                        {offer.id || `Offer ${index + 1}`}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {getOfferValue(offer, "pickupLocation")} to{" "}
                        {getOfferValue(offer, "destination")}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {getOfferValue(offer, "packageType", "General Goods")} (
                        {getOfferWeight(offer)} kg)
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {getOfferValue(offer, "pickupDate")} at{" "}
                        {getOfferValue(offer, "pickupTime")}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleLoadAcceptedOffer(offer)}
                          className="rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                        >
                          Load Offer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-6 text-slate-600">
              No accepted offers are ready for vehicle availability checking
              yet.
            </p>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-xl font-bold">Route Calculation</h3>
              <p className="mt-1 text-sm text-slate-600">
                Enter route and package details to estimate trip requirements.
              </p>
            </div>

            <div className="grid gap-6 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={routeData.pickupLocation}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                  {errors.pickupLocation && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.pickupLocation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Destination
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={routeData.destination}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                  {errors.destination && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.destination}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Package Type
                  </label>
                  <select
                    name="packageType"
                    value={routeData.packageType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  >
                    <option>General Goods</option>
                    <option>Perishable Goods</option>
                    <option>Fragile Items</option>
                    <option>Heavy Cargo</option>
                    <option>Medical Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Package Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="packageWeight"
                    value={routeData.packageWeight}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                  {errors.packageWeight && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.packageWeight}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    value={routeData.pickupDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                  {errors.pickupDate && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.pickupDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    name="pickupTime"
                    value={routeData.pickupTime}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                  {errors.pickupTime && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.pickupTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={handleCalculateRoute}
                  className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Calculate Route
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Route Result</h3>
            <p className="mt-1 text-sm text-slate-600">
              Estimated trip result and recommended vehicle type.
            </p>

            {routeResult ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-700">Route</p>
                  <p className="mt-1 font-bold">{routeResult.routeLabel}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Distance</p>
                    <p className="mt-1 text-2xl font-bold">
                      {routeResult.distance} km
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Duration</p>
                    <p className="mt-1 text-2xl font-bold">
                      {routeResult.duration}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm text-slate-600">Recommended Vehicle</p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {routeResult.recommendedVehicle}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-slate-600">
                Enter route details and click Calculate Route.
              </p>
            )}
          </aside>
        </div>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-bold">Vehicle Availability</h3>
            <p className="mt-1 text-sm text-slate-600">
              Book a suitable vehicle and block duplicate bookings for the same
              schedule.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="border-b border-slate-200 px-6 py-3">
                    Vehicle ID
                  </th>
                  <th className="border-b border-slate-200 px-6 py-3">Type</th>
                  <th className="border-b border-slate-200 px-6 py-3">
                    Plate Number
                  </th>
                  <th className="border-b border-slate-200 px-6 py-3">
                    Capacity
                  </th>
                  <th className="border-b border-slate-200 px-6 py-3">
                    Status
                  </th>
                  <th className="border-b border-slate-200 px-6 py-3">Match</th>
                  <th className="border-b border-slate-200 px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {vehicles.map((vehicle) => {
                  const isBooked = isVehicleBookedForSchedule(vehicle.id);
                  const displayStatus = isBooked ? "booked" : vehicle.status;

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-6 py-4 font-semibold">
                        {vehicle.id}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {vehicle.type}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {vehicle.plateNumber}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {vehicle.capacityKg.toLocaleString()} kg
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getVehicleStatusClass(
                            displayStatus,
                          )}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {isRecommendedVehicle(vehicle) ? (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Recommended
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleBookVehicle(vehicle)}
                          disabled={displayStatus !== "available"}
                          className="rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Book Vehicle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-bold">Vehicle Bookings</h3>
            <p className="mt-1 text-sm text-slate-600">
              Saved bookings used to prevent double booking.
            </p>
          </div>

          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Vehicle
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Route
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Package
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Schedule
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Trip
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-6 py-4">
                        <p className="font-semibold">{booking.vehicleType}</p>
                        <p className="text-slate-600">{booking.plateNumber}</p>
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {booking.pickupLocation} to {booking.destination}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {booking.packageType}, {booking.packageWeight} kg
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {booking.pickupDate} at {booking.pickupTime}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {booking.distance} km, {booking.duration}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-6 text-slate-600">
              No vehicles have been booked yet.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

export default VehicleAvailabilityPage;
