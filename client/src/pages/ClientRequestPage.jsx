import { useEffect, useState } from "react";

// This object keeps the default empty values for the client request form.
const emptyFormData = {
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
  "Perishable Goods",
  "Fragile Items",
  "Heavy Cargo",
  "Medical Supplies",
];

function ClientRequestPage({ onViewRequests }) {
  const [formData, setFormData] = useState(emptyFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  // Loads a saved draft from local storage when the page first opens.
  useEffect(() => {
    const savedDraft = localStorage.getItem("fasttrans-client-request-draft");

    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Updates form input values and clears errors as the user types.
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

    if (statusMessage) {
      setStatusMessage("");
      setStatusType("");
    }
  };

  // Checks required fields before the request is submitted.
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required.";
    }

    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required.";
    }

    if (!formData.weight || Number(formData.weight) <= 0) {
      newErrors.weight = "Enter a valid package weight.";
    }

    if (!formData.pickupDate) {
      newErrors.pickupDate = "Pickup date is required.";
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = "Pickup time is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sends the transport request to the Express backend API.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setStatusMessage("Please fix the highlighted fields before submitting.");
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatusMessage(result.message || "Failed to submit request.");
        setStatusType("error");
        return;
      }

      console.log("Saved request:", result.data);

      localStorage.removeItem("fasttrans-client-request-draft");
      setFormData(emptyFormData);
      setErrors({});
      setStatusMessage("Transport request submitted to server successfully.");
      setStatusType("success");
    } catch (error) {
      console.error("Submit request error:", error);
      setStatusMessage("Could not connect to the FastTrans server.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Saves the current form data in the browser so the user can continue later.
  const handleSaveDraft = () => {
    localStorage.setItem(
      "fasttrans-client-request-draft",
      JSON.stringify(formData),
    );

    setStatusMessage("Draft saved successfully.");
    setStatusType("success");
  };

  // Removes the saved draft and clears the form fields.
  const handleClearDraft = () => {
    localStorage.removeItem("fasttrans-client-request-draft");
    setFormData(emptyFormData);
    setErrors({});
    setStatusMessage("Draft cleared successfully.");
    setStatusType("success");
  };

  // Clears the current form and prepares the page for a fresh request.
  const handleNewRequest = () => {
    setFormData(emptyFormData);
    setErrors({});
    setStatusMessage("");
    setStatusType("");
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Client Request Module
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-950">
                FastTrans
              </h1>
              <p className="mt-1 text-slate-600">
                Submit transport details and track client requests.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onViewRequests}
                className="rounded-md border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                View Requests
              </button>

              <button
                type="button"
                onClick={handleNewRequest}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                New Request
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-2xl font-bold">Submit Transport Request</h2>
              <p className="mt-1 text-slate-600">
                Complete the required trip, package, and schedule information.
              </p>

              {statusMessage && (
                <div
                  className={`mt-4 rounded-md px-4 py-3 text-sm font-medium ${
                    statusType === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {statusMessage}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 p-6">
              <div>
                <h3 className="mb-4 text-lg font-bold">Route Information</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Pickup Location <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                      placeholder="Nairobi, Kenya"
                    />
                    {errors.pickupLocation && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.pickupLocation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Destination <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                      placeholder="Mombasa, Kenya"
                    />
                    {errors.destination && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.destination}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-bold">Package Details</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Package Type
                    </label>
                    <select
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                    >
                      {packageTypes.map((packageType) => (
                        <option key={packageType}>{packageType}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Weight (kg) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                      placeholder="25"
                    />
                    {errors.weight && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.weight}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-bold">Pickup Schedule</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Pickup Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
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
                      Pickup Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      name="pickupTime"
                      value={formData.pickupTime}
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
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-800">
                  Special Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="5"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  placeholder="Handle carefully"
                />
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="rounded-md border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Clear Draft
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Request Summary</h2>
            <p className="mt-1 text-sm text-slate-600">
              Live preview of the current client request.
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex justify-between border-b border-slate-200 pb-4">
                <span className="text-slate-600">Estimated Distance</span>
                <strong>485 km</strong>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-4">
                <span className="text-slate-600">Estimated Duration</span>
                <strong>7h 20m</strong>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-4">
                <span className="text-slate-600">Vehicle Match</span>
                <strong>Truck</strong>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-4">
                <span className="text-slate-600">Estimated Cost</span>
                <strong className="text-blue-700">KES 7,867</strong>
              </div>
            </div>

            <div className="mt-8 rounded-md bg-slate-100 p-5">
              <h3 className="mb-4 font-bold">Route Preview</h3>
              <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-4 text-center text-slate-600">
                {formData.pickupLocation || "Pickup location"} to{" "}
                {formData.destination || "Destination"}
              </div>
            </div>

            <div className="mt-6 rounded-md border border-slate-200 p-4">
              <h3 className="font-bold">Current Package</h3>
              <p className="mt-2 text-sm text-slate-600">
                {formData.packageType}{" "}
                {formData.weight ? `• ${formData.weight} kg` : ""}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default ClientRequestPage;
