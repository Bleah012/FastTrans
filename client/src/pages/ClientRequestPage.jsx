import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  MapPin,
  Package,
  RotateCcw,
  Save,
  Send,
  Truck,
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import { getAuthToken, getAuthUser } from "../config/auth";

const draftStorageKey = "fasttrans-client-request-draft";

const defaultFormData = {
  pickupLocation: "",
  destination: "",
  packageType: "General Goods",
  weight: "",
  pickupDate: "",
  pickupTime: "",
  instructions: "",
};

const packageTypes = [
  "General Goods",
  "Fragile Goods",
  "Perishable Goods",
  "Heavy Cargo",
  "Medical Supplies",
  "Electronics",
];

function ClientRequestPage({ onViewRequests }) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const authUser = getAuthUser();

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftStorageKey);

    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch {
        localStorage.removeItem(draftStorageKey);
      }
    }
  }, []);

  const showStatus = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const calculateSummary = () => {
    const weight = Number(formData.weight) || 0;
    const distance = 485;
    const baseCost = 2500;
    const weightCost = weight * 95;
    const distanceCost = distance * 6.2;
    const estimatedCost = Math.round(baseCost + weightCost + distanceCost);

    let vehicleMatch = "Pickup";

    if (weight > 5000) {
      vehicleMatch = "Heavy Cargo Trailer";
    } else if (weight > 1500) {
      vehicleMatch = "Truck";
    } else if (weight > 500) {
      vehicleMatch = "Van";
    } else if (weight > 0) {
      vehicleMatch = "Pickup";
    }

    return {
      distance: `${distance} km`,
      duration: "7h 20m",
      vehicleMatch,
      estimatedCost,
    };
  };

  const summary = calculateSummary();

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.pickupLocation.trim()) {
      nextErrors.pickupLocation = "Pickup location is required.";
    }

    if (!formData.destination.trim()) {
      nextErrors.destination = "Destination is required.";
    }

    if (!formData.packageType) {
      nextErrors.packageType = "Package type is required.";
    }

    if (!formData.weight || Number(formData.weight) <= 0) {
      nextErrors.weight = "Weight must be greater than 0.";
    }

    if (!formData.pickupDate) {
      nextErrors.pickupDate = "Pickup date is required.";
    }

    if (!formData.pickupTime) {
      nextErrors.pickupTime = "Pickup time is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(draftStorageKey, JSON.stringify(formData));
    showStatus("Draft saved successfully.");
  };

  const handleClearDraft = () => {
    localStorage.removeItem(draftStorageKey);
    setFormData(defaultFormData);
    setErrors({});
    setReceipt(null);
    showStatus("Draft cleared successfully.");
  };

  const handleNewRequest = () => {
    setFormData(defaultFormData);
    setErrors({});
    setReceipt(null);
    setStatusMessage("");
    localStorage.removeItem(draftStorageKey);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showStatus("Please correct the highlighted fields.", "error");
      return;
    }

    const authToken = getAuthToken();
    const currentUser = getAuthUser();

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.requests, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          client: currentUser?.id,
          clientName: currentUser?.name,
          clientEmail: currentUser?.email,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit request.");
      }

      localStorage.removeItem(draftStorageKey);
      setReceipt(result.data);
      setFormData(defaultFormData);
      showStatus("Transport request submitted successfully.");
    } catch (error) {
      showStatus(error.message || "Failed to submit request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Client Request Module
            </p>
            <h1 className="mt-2 text-3xl font-black">
              Submit a New Transport Request
            </h1>
            <p className="mt-2 text-slate-600">
              Capture route, package, and pickup schedule details.
            </p>
            {authUser && (
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Signed in as {authUser.name} ({authUser.email})
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onViewRequests}
              className="inline-flex items-center gap-2 rounded-md border border-blue-700 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <ClipboardCheck size={18} />
              View Requests
            </button>
            <button
              type="button"
              onClick={handleNewRequest}
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <FileText size={18} />
              New Request
            </button>
          </div>
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

        {receipt && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={24} />
              <div>
                <h2 className="font-bold">Request Receipt</h2>
                <p className="mt-1 text-sm">
                  Request {receipt.id} was saved for{" "}
                  {receipt.clientName || authUser?.name}.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.45fr]">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-2xl font-bold">Submit Transport Request</h2>
              <p className="mt-2 text-slate-600">
                Complete the required trip, package, and schedule information.
              </p>
            </div>

            <div className="grid gap-8 p-6">
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <MapPin size={20} className="text-blue-700" />
                  Route Information
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Pickup Location <span className="text-red-600">*</span>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      placeholder="Nairobi, Kenya"
                    />
                    {errors.pickupLocation && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.pickupLocation}
                      </p>
                    )}
                  </label>

                  <label className="text-sm font-semibold text-slate-700">
                    Destination <span className="text-red-600">*</span>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      placeholder="Mombasa, Kenya"
                    />
                    {errors.destination && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.destination}
                      </p>
                    )}
                  </label>
                </div>
              </section>

              <section>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Package size={20} className="text-blue-700" />
                  Package Details
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Package Type
                    <select
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    >
                      {packageTypes.map((packageType) => (
                        <option key={packageType} value={packageType}>
                          {packageType}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-semibold text-slate-700">
                    Weight (kg) <span className="text-red-600">*</span>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      placeholder="25"
                    />
                    {errors.weight && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.weight}
                      </p>
                    )}
                  </label>
                </div>
              </section>

              <section>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Clock size={20} className="text-blue-700" />
                  Pickup Schedule
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Pickup Date <span className="text-red-600">*</span>
                    <input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    />
                    {errors.pickupDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.pickupDate}
                      </p>
                    )}
                  </label>

                  <label className="text-sm font-semibold text-slate-700">
                    Pickup Time <span className="text-red-600">*</span>
                    <input
                      type="time"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    />
                    {errors.pickupTime && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.pickupTime}
                      </p>
                    )}
                  </label>
                </div>
              </section>

              <label className="text-sm font-semibold text-slate-700">
                Special Instructions
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="5"
                  className="mt-2 w-full resize-y rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  placeholder="Add handling notes, delivery details, or special care instructions."
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  <Send size={18} />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Save size={18} />
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
                >
                  <RotateCcw size={18} />
                  Clear
                </button>
              </div>
            </div>
          </form>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Request Summary</h2>
            <p className="mt-2 text-sm text-slate-600">
              Live preview of the current client request.
            </p>

            <div className="mt-6 divide-y divide-slate-200">
              <div className="flex justify-between py-4">
                <span className="text-slate-600">Estimated Distance</span>
                <strong>{summary.distance}</strong>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-slate-600">Estimated Duration</span>
                <strong>{summary.duration}</strong>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-slate-600">Vehicle Match</span>
                <strong>{summary.vehicleMatch}</strong>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-slate-600">Estimated Cost</span>
                <strong className="text-blue-700">
                  {formatCurrency(summary.estimatedCost)}
                </strong>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-slate-100 p-5">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <Truck size={18} className="text-blue-700" />
                Route Preview
              </h3>
              <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-4 text-center text-slate-600">
                {formData.pickupLocation || "Pickup location"} to{" "}
                {formData.destination || "Destination"}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default ClientRequestPage;
