import { useEffect, useState } from "react";

const bookingStorageKey = "fasttrans-vehicle-bookings";
const scheduleStorageKey = "fasttrans-confirmed-schedules";
const vehicleStorageKey = "fasttrans-admin-vehicles";

const defaultVehicleForm = {
  id: "",
  type: "",
  plateNumber: "",
  capacityKg: "",
  availability: "available",
};

const defaultVehicles = [
  {
    id: "VH-001",
    type: "Pickup",
    plateNumber: "KDA 102A",
    capacityKg: 200,
    availability: "available",
  },
  {
    id: "VH-002",
    type: "Van",
    plateNumber: "KDB 455B",
    capacityKg: 1000,
    availability: "available",
  },
  {
    id: "VH-003",
    type: "Truck",
    plateNumber: "KDC 889C",
    capacityKg: 5000,
    availability: "available",
  },
  {
    id: "VH-004",
    type: "Refrigerated Truck",
    plateNumber: "KDD 701D",
    capacityKg: 3000,
    availability: "available",
  },
  {
    id: "VH-005",
    type: "Heavy Cargo Trailer",
    plateNumber: "KDE 240E",
    capacityKg: 12000,
    availability: "maintenance",
  },
];

function SchedulingAdminPage() {
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [confirmedSchedules, setConfirmedSchedules] = useState([]);
  const [managedVehicles, setManagedVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState(defaultVehicleForm);
  const [editingVehicleId, setEditingVehicleId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  // Loads confirmed vehicle bookings, saved schedules, and managed vehicles from browser storage.
  useEffect(() => {
    const savedBookings =
      JSON.parse(localStorage.getItem(bookingStorageKey)) || [];
    const savedSchedules =
      JSON.parse(localStorage.getItem(scheduleStorageKey)) || [];
    const savedVehicles =
      JSON.parse(localStorage.getItem(vehicleStorageKey)) || defaultVehicles;

    setVehicleBookings(savedBookings);
    setConfirmedSchedules(savedSchedules);
    setManagedVehicles(savedVehicles);
  }, []);

  // Saves vehicle changes to state and localStorage.
  const saveVehicles = (vehicles) => {
    setManagedVehicles(vehicles);
    localStorage.setItem(vehicleStorageKey, JSON.stringify(vehicles));
  };

  // Gives each schedule status a clear visual badge.
  const getStatusClass = (status) => {
    if (status === "scheduled") return "bg-emerald-50 text-emerald-700";
    if (status === "in-progress") return "bg-blue-50 text-blue-700";
    if (status === "completed") return "bg-slate-100 text-slate-700";
    if (status === "booked") return "bg-amber-50 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  // Gives vehicle availability a clear visual badge.
  const getAvailabilityClass = (availability) => {
    if (availability === "available") return "bg-emerald-50 text-emerald-700";
    if (availability === "booked") return "bg-amber-50 text-amber-700";
    if (availability === "maintenance") return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  // Checks whether a vehicle booking has already become a confirmed schedule.
  const isBookingScheduled = (bookingId) => {
    return confirmedSchedules.some(
      (schedule) => schedule.bookingId === bookingId,
    );
  };

  // Confirms a vehicle booking as a scheduled transport request.
  const handleConfirmSchedule = (booking) => {
    if (isBookingScheduled(booking.id)) {
      setStatusMessage(
        "This booking has already been confirmed for scheduling.",
      );
      setStatusType("error");
      return;
    }

    const newSchedule = {
      id: Date.now().toString(),
      bookingId: booking.id,
      sourceOfferId: booking.sourceOfferId,
      vehicleId: booking.vehicleId,
      vehicleType: booking.vehicleType,
      plateNumber: booking.plateNumber,
      pickupLocation: booking.pickupLocation,
      destination: booking.destination,
      packageType: booking.packageType,
      packageWeight: booking.packageWeight,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      distance: booking.distance,
      duration: booking.duration,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    const updatedSchedules = [newSchedule, ...confirmedSchedules];

    setConfirmedSchedules(updatedSchedules);
    localStorage.setItem(scheduleStorageKey, JSON.stringify(updatedSchedules));

    setStatusMessage("Transport booking confirmed and scheduled successfully.");
    setStatusType("success");
  };

  // Updates the progress status of a confirmed transport schedule.
  const handleUpdateScheduleStatus = (scheduleId, newStatus) => {
    const updatedSchedules = confirmedSchedules.map((schedule) =>
      schedule.id === scheduleId
        ? {
            ...schedule,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        : schedule,
    );

    setConfirmedSchedules(updatedSchedules);
    localStorage.setItem(scheduleStorageKey, JSON.stringify(updatedSchedules));

    setStatusMessage(`Schedule marked as ${newStatus}.`);
    setStatusType("success");
  };

  // Updates vehicle form fields for creating and editing vehicles.
  const handleVehicleFormChange = (event) => {
    const { name, value } = event.target;

    setVehicleForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  // Clears the vehicle form and exits edit mode.
  const resetVehicleForm = () => {
    setVehicleForm(defaultVehicleForm);
    setEditingVehicleId("");
  };

  // Creates a new vehicle or updates an existing vehicle.
  const handleSubmitVehicle = (event) => {
    event.preventDefault();

    const cleanVehicle = {
      id: vehicleForm.id.trim().toUpperCase(),
      type: vehicleForm.type.trim(),
      plateNumber: vehicleForm.plateNumber.trim().toUpperCase(),
      capacityKg: Number(vehicleForm.capacityKg),
      availability: vehicleForm.availability,
    };

    if (
      !cleanVehicle.id ||
      !cleanVehicle.type ||
      !cleanVehicle.plateNumber ||
      cleanVehicle.capacityKg <= 0
    ) {
      setStatusMessage("Please complete all vehicle fields correctly.");
      setStatusType("error");
      return;
    }

    if (!editingVehicleId) {
      const vehicleExists = managedVehicles.some(
        (vehicle) => vehicle.id === cleanVehicle.id,
      );

      if (vehicleExists) {
        setStatusMessage("A vehicle with this ID already exists.");
        setStatusType("error");
        return;
      }

      saveVehicles([cleanVehicle, ...managedVehicles]);
      setStatusMessage("Vehicle added successfully.");
      setStatusType("success");
      resetVehicleForm();
      return;
    }

    const updatedVehicles = managedVehicles.map((vehicle) =>
      vehicle.id === editingVehicleId ? cleanVehicle : vehicle,
    );

    saveVehicles(updatedVehicles);
    setStatusMessage("Vehicle details updated successfully.");
    setStatusType("success");
    resetVehicleForm();
  };

  // Loads a selected vehicle into the form for editing.
  const handleEditVehicle = (vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      id: vehicle.id,
      type: vehicle.type,
      plateNumber: vehicle.plateNumber,
      capacityKg: vehicle.capacityKg.toString(),
      availability: vehicle.availability,
    });

    setStatusMessage("Vehicle loaded for editing.");
    setStatusType("success");
  };

  // Deletes a vehicle from admin vehicle management.
  const handleDeleteVehicle = (vehicleId) => {
    const updatedVehicles = managedVehicles.filter(
      (vehicle) => vehicle.id !== vehicleId,
    );

    saveVehicles(updatedVehicles);

    if (editingVehicleId === vehicleId) {
      resetVehicleForm();
    }

    setStatusMessage("Vehicle deleted successfully.");
    setStatusType("success");
  };

  // Updates a vehicle's availability directly from the admin table.
  const handleUpdateVehicleAvailability = (vehicleId, availability) => {
    const updatedVehicles = managedVehicles.map((vehicle) =>
      vehicle.id === vehicleId ? { ...vehicle, availability } : vehicle,
    );

    saveVehicles(updatedVehicles);
    setStatusMessage("Vehicle availability updated successfully.");
    setStatusType("success");
  };

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Elvis Module
          </p>
          <h2 className="mt-1 text-3xl font-bold">
            Scheduling and Admin Dashboard
          </h2>
          <p className="mt-1 text-slate-600">
            Schedule confirmed transport bookings, view scheduled requests, and
            manage vehicle availability.
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

        <section className="mb-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Vehicle Bookings
            </p>
            <p className="mt-2 text-3xl font-bold">{vehicleBookings.length}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Confirmed Schedules
            </p>
            <p className="mt-2 text-3xl font-bold">
              {confirmedSchedules.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Ready to Schedule
            </p>
            <p className="mt-2 text-3xl font-bold">
              {
                vehicleBookings.filter(
                  (booking) => !isBookingScheduled(booking.id),
                ).length
              }
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Available Vehicles
            </p>
            <p className="mt-2 text-3xl font-bold">
              {
                managedVehicles.filter(
                  (vehicle) => vehicle.availability === "available",
                ).length
              }
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-bold">
              Vehicle Bookings Ready for Scheduling
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              These bookings come from Nathaniel's vehicle availability module.
            </p>
          </div>

          {vehicleBookings.length > 0 ? (
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
                    <th className="border-b border-slate-200 px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vehicleBookings.map((booking) => {
                    const alreadyScheduled = isBookingScheduled(booking.id);

                    return (
                      <tr key={booking.id} className="hover:bg-slate-50">
                        <td className="border-b border-slate-100 px-6 py-4">
                          <p className="font-semibold">{booking.vehicleType}</p>
                          <p className="text-slate-600">
                            {booking.plateNumber}
                          </p>
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
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              alreadyScheduled ? "scheduled" : booking.status,
                            )}`}
                          >
                            {alreadyScheduled ? "scheduled" : booking.status}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleConfirmSchedule(booking)}
                            disabled={alreadyScheduled}
                            className="rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {alreadyScheduled
                              ? "Scheduled"
                              : "Confirm Schedule"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-6 text-slate-600">
              No vehicle bookings are ready for scheduling yet.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-bold">Confirmed Transport Schedules</h3>
            <p className="mt-1 text-sm text-slate-600">
              Admin view of transport requests that have been scheduled.
            </p>
          </div>

          {confirmedSchedules.length > 0 ? (
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
                    <th className="border-b border-slate-200 px-6 py-3">
                      Manage
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {confirmedSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-6 py-4">
                        <p className="font-semibold">{schedule.vehicleType}</p>
                        <p className="text-slate-600">{schedule.plateNumber}</p>
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {schedule.pickupLocation} to {schedule.destination}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {schedule.packageType}, {schedule.packageWeight} kg
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {schedule.pickupDate} at {schedule.pickupTime}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {schedule.distance} km, {schedule.duration}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            schedule.status,
                          )}`}
                        >
                          {schedule.status}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateScheduleStatus(
                                schedule.id,
                                "in-progress",
                              )
                            }
                            disabled={
                              schedule.status === "in-progress" ||
                              schedule.status === "completed"
                            }
                            className="rounded-md border border-blue-700 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                          >
                            Start
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateScheduleStatus(
                                schedule.id,
                                "completed",
                              )
                            }
                            disabled={schedule.status === "completed"}
                            className="rounded-md border border-emerald-700 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                          >
                            Complete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-6 text-slate-600">
              No confirmed schedules have been created yet.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-bold">Vehicle Management</h3>
            <p className="mt-1 text-sm text-slate-600">
              Admin can create, view, update, and delete vehicles.
            </p>
          </div>

          <form
            onSubmit={handleSubmitVehicle}
            className="grid gap-4 border-b border-slate-200 p-6 lg:grid-cols-6"
          >
            <input
              type="text"
              name="id"
              value={vehicleForm.id}
              onChange={handleVehicleFormChange}
              disabled={Boolean(editingVehicleId)}
              placeholder="Vehicle ID"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-700 disabled:bg-slate-100"
            />

            <input
              type="text"
              name="type"
              value={vehicleForm.type}
              onChange={handleVehicleFormChange}
              placeholder="Vehicle type"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
            />

            <input
              type="text"
              name="plateNumber"
              value={vehicleForm.plateNumber}
              onChange={handleVehicleFormChange}
              placeholder="Plate number"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
            />

            <input
              type="number"
              name="capacityKg"
              value={vehicleForm.capacityKg}
              onChange={handleVehicleFormChange}
              placeholder="Capacity kg"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
            />

            <select
              name="availability"
              value={vehicleForm.availability}
              onChange={handleVehicleFormChange}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
            >
              <option value="available">available</option>
              <option value="booked">booked</option>
              <option value="maintenance">maintenance</option>
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                {editingVehicleId ? "Update" : "Add"}
              </button>

              {editingVehicleId && (
                <button
                  type="button"
                  onClick={resetVehicleForm}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

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
                    Availability
                  </th>
                  <th className="border-b border-slate-200 px-6 py-3">
                    Quick Update
                  </th>
                  <th className="border-b border-slate-200 px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {managedVehicles.map((vehicle) => (
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
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getAvailabilityClass(
                          vehicle.availability,
                        )}`}
                      >
                        {vehicle.availability}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-6 py-4">
                      <select
                        value={vehicle.availability}
                        onChange={(event) =>
                          handleUpdateVehicleAvailability(
                            vehicle.id,
                            event.target.value,
                          )
                        }
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-700"
                      >
                        <option value="available">available</option>
                        <option value="booked">booked</option>
                        <option value="maintenance">maintenance</option>
                      </select>
                    </td>
                    <td className="border-b border-slate-100 px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditVehicle(vehicle)}
                          className="rounded-md border border-blue-700 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="rounded-md border border-red-700 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default SchedulingAdminPage;
