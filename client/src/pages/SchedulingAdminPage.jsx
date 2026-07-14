import { useEffect, useState } from "react";
import {
  CalendarCheck,
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
  Truck,
  Wrench,
} from "lucide-react";
import AdminAreaNotice, { hasAdminAccess } from "../components/AdminAreaNotice";

const bookingStorageKey = "fasttrans-vehicle-bookings";
const scheduleStorageKey = "fasttrans-confirmed-schedules";
const vehicleStorageKey = "fasttrans-admin-vehicles";
const acceptedOfferStorageKey = "fasttrans-accepted-offers";

const defaultVehicleForm = {
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

function readStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function SchedulingAdminPage() {
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [confirmedSchedules, setConfirmedSchedules] = useState([]);
  const [managedVehicles, setManagedVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState(defaultVehicleForm);
  const [editingVehicleId, setEditingVehicleId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  const canAccessAdminArea = hasAdminAccess();

  useEffect(() => {
    if (!canAccessAdminArea) {
      return;
    }

    const savedBookings = readStorage(bookingStorageKey, []);
    const savedSchedules = readStorage(scheduleStorageKey, []);
    const savedVehicles = readStorage(vehicleStorageKey, defaultVehicles);

    setVehicleBookings(savedBookings);
    setConfirmedSchedules(savedSchedules);
    setManagedVehicles(savedVehicles);
  }, [canAccessAdminArea]);

  const showStatus = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const saveSchedules = (schedules) => {
    setConfirmedSchedules(schedules);
    localStorage.setItem(scheduleStorageKey, JSON.stringify(schedules));
  };

  const saveVehicles = (vehicles) => {
    setManagedVehicles(vehicles);
    localStorage.setItem(vehicleStorageKey, JSON.stringify(vehicles));
  };

  const getBookingId = (booking) => booking.id || booking.bookingId;

  const getBookingVehicle = (booking) => ({
    type:
      booking.vehicleType ||
      booking.vehicleMatch ||
      booking.selectedVehicle ||
      booking.vehicle ||
      "Vehicle",
    plate:
      booking.plateNumber ||
      booking.vehiclePlate ||
      booking.plate ||
      booking.registrationNumber ||
      "Unassigned",
  });

  const isBookingScheduled = (bookingId) =>
    confirmedSchedules.some((schedule) => schedule.bookingId === bookingId);

  const getStatusClass = (status) => {
    if (status === "scheduled") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "completed") {
      return "bg-blue-50 text-blue-700";
    }

    if (status === "cancelled") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  const getAvailabilityClass = (availability) => {
    if (availability === "available") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (availability === "booked") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  const handleConfirmSchedule = (booking) => {
    const bookingId = getBookingId(booking);

    if (!bookingId || isBookingScheduled(bookingId)) {
      showStatus("This booking has already been scheduled.", "error");
      return;
    }

    const bookingVehicle = getBookingVehicle(booking);

    const schedule = {
      id: `SCHEDULE-${Date.now()}`,
      bookingId,
      sourceOfferId: booking.sourceOfferId || booking.offerId || "",
      vehicleType: bookingVehicle.type,
      plateNumber: bookingVehicle.plate,
      pickupLocation: booking.pickupLocation,
      destination: booking.destination,
      packageType: booking.packageType,
      weight: booking.weight,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      distance: booking.distance || booking.estimatedDistance || "485 km",
      duration: booking.duration || booking.estimatedDuration || "7h 20m",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    saveSchedules([schedule, ...confirmedSchedules]);

    const updatedVehicles = managedVehicles.map((vehicle) =>
      vehicle.plateNumber === bookingVehicle.plate
        ? { ...vehicle, availability: "booked" }
        : vehicle,
    );

    saveVehicles(updatedVehicles);
    showStatus("Transport booking scheduled successfully.");
  };

  const handleUpdateScheduleStatus = (scheduleId, newStatus) => {
    const selectedSchedule = confirmedSchedules.find(
      (schedule) => schedule.id === scheduleId,
    );

    const updatedSchedules = confirmedSchedules.map((schedule) =>
      schedule.id === scheduleId
        ? { ...schedule, status: newStatus }
        : schedule,
    );

    saveSchedules(updatedSchedules);

    if (
      selectedSchedule &&
      (newStatus === "completed" || newStatus === "cancelled")
    ) {
      const updatedVehicles = managedVehicles.map((vehicle) =>
        vehicle.plateNumber === selectedSchedule.plateNumber
          ? { ...vehicle, availability: "available" }
          : vehicle,
      );

      saveVehicles(updatedVehicles);
    }

    showStatus(`Schedule marked as ${newStatus}.`);
  };

  const handleVehicleFormChange = (event) => {
    const { name, value } = event.target;
    setVehicleForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const resetVehicleForm = () => {
    setVehicleForm(defaultVehicleForm);
    setEditingVehicleId("");
  };

  const handleSubmitVehicle = (event) => {
    event.preventDefault();

    if (
      !vehicleForm.type ||
      !vehicleForm.plateNumber ||
      !vehicleForm.capacityKg
    ) {
      showStatus("Please provide all vehicle details.", "error");
      return;
    }

    if (editingVehicleId) {
      const updatedVehicles = managedVehicles.map((vehicle) =>
        vehicle.id === editingVehicleId
          ? {
              ...vehicle,
              type: vehicleForm.type,
              plateNumber: vehicleForm.plateNumber,
              capacityKg: Number(vehicleForm.capacityKg),
              availability: vehicleForm.availability,
            }
          : vehicle,
      );

      saveVehicles(updatedVehicles);
      resetVehicleForm();
      showStatus("Vehicle updated successfully.");
      return;
    }

    const newVehicle = {
      id: `VH-${Date.now()}`,
      type: vehicleForm.type,
      plateNumber: vehicleForm.plateNumber,
      capacityKg: Number(vehicleForm.capacityKg),
      availability: vehicleForm.availability,
    };

    saveVehicles([newVehicle, ...managedVehicles]);
    resetVehicleForm();
    showStatus("Vehicle added successfully.");
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      type: vehicle.type,
      plateNumber: vehicle.plateNumber,
      capacityKg: vehicle.capacityKg,
      availability: vehicle.availability,
    });
  };

  const handleDeleteVehicle = (vehicleId) => {
    const updatedVehicles = managedVehicles.filter(
      (vehicle) => vehicle.id !== vehicleId,
    );

    saveVehicles(updatedVehicles);
    showStatus("Vehicle deleted successfully.");
  };

  const handleUpdateVehicleAvailability = (vehicleId, availability) => {
    const updatedVehicles = managedVehicles.map((vehicle) =>
      vehicle.id === vehicleId ? { ...vehicle, availability } : vehicle,
    );

    saveVehicles(updatedVehicles);
    showStatus("Vehicle availability updated successfully.");
  };

  if (!canAccessAdminArea) {
    return (
      <main className="px-6 py-8 text-slate-950">
        <section className="mx-auto max-w-7xl">
          <AdminAreaNotice
            title="Scheduling Admin Access"
            description="Login as an admin or manager before managing confirmed bookings and vehicle schedules."
          />
        </section>
      </main>
    );
  }

  const readyBookings = vehicleBookings.filter(
    (booking) => !isBookingScheduled(getBookingId(booking)),
  );

  const availableVehicles = managedVehicles.filter(
    (vehicle) => vehicle.availability === "available",
  );

  const summaryCards = [
    {
      label: "Vehicle Bookings",
      value: vehicleBookings.length,
      icon: ClipboardList,
    },
    {
      label: "Confirmed Schedules",
      value: confirmedSchedules.length,
      icon: CalendarCheck,
    },
    {
      label: "Ready to Schedule",
      value: readyBookings.length,
      icon: Truck,
    },
    {
      label: "Available Vehicles",
      value: availableVehicles.length,
      icon: Wrench,
    },
  ];

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <AdminAreaNotice
          title="Scheduling Admin Access"
          description="Login as an admin or manager before managing confirmed bookings and vehicle schedules."
        />

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Elvis Module
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Scheduling and Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Schedule confirmed transport bookings, view scheduled requests, and
            manage vehicle availability.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`mb-6 rounded-md px-4 py-3 text-sm font-semibold ${
              statusType === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">{card.label}</p>
                  <Icon className="text-blue-700" size={22} />
                </div>
                <p className="mt-4 text-3xl font-bold">{card.value}</p>
              </div>
            );
          })}
        </div>

        <section className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold">
              Vehicle Bookings Ready for Scheduling
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              These bookings come from Nathaniel's vehicle availability module.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Package</th>
                  <th className="px-5 py-4">Schedule</th>
                  <th className="px-5 py-4">Trip</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicleBookings.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-slate-600" colSpan="7">
                      No vehicle bookings are ready yet.
                    </td>
                  </tr>
                )}

                {vehicleBookings.map((booking) => {
                  const bookingId = getBookingId(booking);
                  const bookingVehicle = getBookingVehicle(booking);
                  const scheduled = isBookingScheduled(bookingId);

                  return (
                    <tr key={bookingId} className="border-t border-slate-100">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{bookingVehicle.type}</p>
                        <p className="text-slate-600">{bookingVehicle.plate}</p>
                      </td>
                      <td className="px-5 py-4">
                        {booking.pickupLocation} to {booking.destination}
                      </td>
                      <td className="px-5 py-4">
                        {booking.packageType}, {booking.weight} kg
                      </td>
                      <td className="px-5 py-4">
                        {booking.pickupDate} at {booking.pickupTime}
                      </td>
                      <td className="px-5 py-4">
                        {booking.distance ||
                          booking.estimatedDistance ||
                          "485 km"}
                        ,{" "}
                        {booking.duration ||
                          booking.estimatedDuration ||
                          "7h 20m"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            scheduled ? "scheduled" : "pending",
                          )}`}
                        >
                          {scheduled ? "scheduled" : "ready"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleConfirmSchedule(booking)}
                          disabled={scheduled}
                          className={`rounded-md px-4 py-2 text-xs font-semibold ${
                            scheduled
                              ? "bg-slate-200 text-slate-500"
                              : "bg-blue-700 text-white hover:bg-blue-800"
                          }`}
                        >
                          {scheduled ? "Scheduled" : "Schedule"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold">Confirmed Transport Schedules</h2>
            <p className="mt-1 text-sm text-slate-600">
              Admin view of transport requests that have been scheduled.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-4">Schedule ID</th>
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Pickup</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {confirmedSchedules.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-slate-600" colSpan="6">
                      No confirmed schedules yet.
                    </td>
                  </tr>
                )}

                {confirmedSchedules.map((schedule) => (
                  <tr key={schedule.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold">{schedule.id}</td>
                    <td className="px-5 py-4">
                      {schedule.pickupLocation} to {schedule.destination}
                    </td>
                    <td className="px-5 py-4">
                      {schedule.vehicleType} - {schedule.plateNumber}
                    </td>
                    <td className="px-5 py-4">
                      {schedule.pickupDate} at {schedule.pickupTime}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          schedule.status,
                        )}`}
                      >
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={schedule.status}
                        onChange={(event) =>
                          handleUpdateScheduleStatus(
                            schedule.id,
                            event.target.value,
                          )
                        }
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleSubmitVehicle}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-bold">Vehicle Management</h2>
            <p className="mt-1 text-sm text-slate-600">
              Add, edit, delete, and update vehicle availability.
            </p>

            <div className="mt-5 grid gap-4">
              <label className="text-sm font-semibold text-slate-700">
                Vehicle Type
                <input
                  type="text"
                  name="type"
                  value={vehicleForm.type}
                  onChange={handleVehicleFormChange}
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3"
                  placeholder="Truck"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Plate Number
                <input
                  type="text"
                  name="plateNumber"
                  value={vehicleForm.plateNumber}
                  onChange={handleVehicleFormChange}
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3"
                  placeholder="KDA 102A"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Capacity (kg)
                <input
                  type="number"
                  name="capacityKg"
                  value={vehicleForm.capacityKg}
                  onChange={handleVehicleFormChange}
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3"
                  placeholder="5000"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Availability
                <select
                  name="availability"
                  value={vehicleForm.availability}
                  onChange={handleVehicleFormChange}
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Plus size={18} />
                {editingVehicleId ? "Update Vehicle" : "Add Vehicle"}
              </button>

              {editingVehicleId && (
                <button
                  type="button"
                  onClick={resetVehicleForm}
                  className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold">Admin Vehicle List</h2>
              <p className="mt-1 text-sm text-slate-600">
                Update the fleet used for scheduling and availability.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-5 py-4">Vehicle</th>
                    <th className="px-5 py-4">Capacity</th>
                    <th className="px-5 py-4">Availability</th>
                    <th className="px-5 py-4">Quick Update</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managedVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-t border-slate-100">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{vehicle.type}</p>
                        <p className="text-slate-600">{vehicle.plateNumber}</p>
                      </td>
                      <td className="px-5 py-4">{vehicle.capacityKg} kg</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getAvailabilityClass(
                            vehicle.availability,
                          )}`}
                        >
                          {vehicle.availability}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={vehicle.availability}
                          onChange={(event) =>
                            handleUpdateVehicleAvailability(
                              vehicle.id,
                              event.target.value,
                            )
                          }
                          className="rounded-md border border-slate-300 px-3 py-2"
                        >
                          <option value="available">Available</option>
                          <option value="booked">Booked</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditVehicle(vehicle)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {managedVehicles.length === 0 && (
                    <tr>
                      <td className="px-5 py-6 text-slate-600" colSpan="5">
                        No vehicles have been added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default SchedulingAdminPage;
