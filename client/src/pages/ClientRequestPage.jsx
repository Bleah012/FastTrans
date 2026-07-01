import { useState } from "react";

function ClientRequestPage() {
  const [formData, setFormData] = useState({
    pickupLocation: "",
    destination: "",
    packageType: "General Goods",
    weight: "",
    pickupDate: "",
    pickupTime: "",
    instructions: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Client request submitted:", formData);
    alert("Transport request captured successfully.");
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
                className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Save Draft
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
