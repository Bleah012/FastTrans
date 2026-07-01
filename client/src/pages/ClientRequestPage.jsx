import { useEffect, useState } from "react";

// This object keeps the default empty values for the form.
const emptyFormData = {
  pickupLocation: "",
  destination: "",
  packageType: "General Goods",
  weight: "",
  pickupDate: "",
  pickupTime: "",
  instructions: "",
};

function ClientRequestPage() {
  // formData stores all values typed or selected by the user.
  const [formData, setFormData] = useState(emptyFormData);

  // errors stores validation messages for fields that are invalid.
  const [errors, setErrors] = useState({});

  // This runs once when the page opens.
  useEffect(() => {
    // Get the saved draft from the browser localStorage.
    const savedDraft = localStorage.getItem("fasttrans-client-request-draft");

    // If a saved draft exists, load it back into the form.
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  function handleChange(event) {
    // Get the input name and value from the field being edited.
    const { name, value } = event.target;

    // Update only the changed field while keeping the rest of the form data.
    setFormData({
      ...formData,
      [name]: value,
    });

    // If this field had an error, clear it once the user starts editing.
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  }

  function validateForm() {
    // Create an empty object to collect validation errors.
    const newErrors = {};

    // Check that pickup location is not empty.
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required.";
    }

    // Check that destination is not empty.
    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required.";
    }

    // Check that weight is entered.
    if (!formData.weight) {
      newErrors.weight = "Weight is required.";
    } else if (Number(formData.weight) <= 0) {
      // Check that weight is greater than zero.
      newErrors.weight = "Weight must be greater than 0.";
    }

    // Check that pickup date is selected.
    if (!formData.pickupDate) {
      newErrors.pickupDate = "Pickup date is required.";
    }

    // Check that pickup time is selected.
    if (!formData.pickupTime) {
      newErrors.pickupTime = "Pickup time is required.";
    }

    // Return all validation errors found.
    return newErrors;
  }

  function handleSubmit(event) {
    // Stop the browser from refreshing the page.
    event.preventDefault();

    // Validate the form before submitting.
    const validationErrors = validateForm();

    // Store validation errors so they can be shown on the page.
    setErrors(validationErrors);

    // If there are errors, stop the submit process.
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // For now, show the submitted data in the browser console.
    console.log("Client request submitted:", formData);

    // Show the user that the request was captured.
    alert("Transport request captured successfully.");
  }

  function handleSaveDraft() {
    // Save the current form data in the browser localStorage.
    localStorage.setItem(
      "fasttrans-client-request-draft",
      JSON.stringify(formData),
    );

    // Notify the user that the draft was saved.
    alert("Draft saved successfully.");
  }

  function handleClearDraft() {
    // Remove the saved draft from browser localStorage.
    localStorage.removeItem("fasttrans-client-request-draft");

    // Reset the form back to empty default values.
    setFormData(emptyFormData);

    // Clear all validation errors.
    setErrors({});

    // Notify the user that the draft was cleared.
    alert("Draft cleared successfully.");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <nav className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">FastTrans</h1>
            <p className="text-sm text-slate-500">Client Request Module</p>
          </div>

          <span className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            New Request
          </span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-950">
                Submit Transport Request
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter trip, package, and schedule details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Pickup Location
                </span>
                <input
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nairobi, Kenya"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                {errors.pickupLocation && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.pickupLocation}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Destination
                </span>
                <input
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  type="text"
                  placeholder="Mombasa, Kenya"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                {errors.destination && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.destination}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Package Type
                </span>
                <select
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option>General Goods</option>
                  <option>Fragile Goods</option>
                  <option>Hazardous Materials</option>
                  <option>Refrigerated Cargo</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Weight (kg)
                </span>
                <input
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  type="number"
                  placeholder="500"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                {errors.weight && (
                  <p className="mt-2 text-sm text-red-600">{errors.weight}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Pickup Date
                </span>
                <input
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  type="date"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                {errors.pickupDate && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.pickupDate}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Pickup Time
                </span>
                <input
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  type="time"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                {errors.pickupTime && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.pickupTime}
                  </p>
                )}
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Special Instructions
              </span>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows="4"
                placeholder="Add handling notes or delivery instructions"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Submit Request
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleClearDraft}
                className="rounded-md border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Clear Draft
              </button>
            </div>
          </form>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Request Summary
            </h3>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Estimated Distance</span>
                <span className="font-medium text-slate-900">485 km</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Estimated Duration</span>
                <span className="font-medium text-slate-900">7h 20m</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Vehicle Match</span>
                <span className="font-medium text-slate-900">Truck</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Cost</span>
                <span className="font-semibold text-blue-700">KES 7,867</span>
              </div>
            </div>

            <div className="mt-6 rounded-md bg-slate-100 p-4">
              <p className="text-sm font-medium text-slate-900">
                Route Preview
              </p>
              <div className="mt-3 flex h-40 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                {formData.pickupLocation || "Nairobi"} to{" "}
                {formData.destination || "Mombasa"}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default ClientRequestPage;
