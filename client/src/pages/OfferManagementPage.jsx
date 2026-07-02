import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

const OFFERS_STORAGE_KEY = "fasttrans-generated-offers";

const defaultOfferData = {
  basePrice: "7500",
  tax: "500",
  discount: "0",
  estimatedDistance: "485",
  estimatedDuration: "7h 20m",
  vehicleMatch: "Truck",
  notes: "Offer includes standard pickup, transport, and delivery handling.",
};

function OfferManagementPage() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offerData, setOfferData] = useState(defaultOfferData);
  const [generatedOffer, setGeneratedOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  // Loads submitted transport requests so Amanda can generate offers from them.
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.requests);
        const result = await response.json();

        if (!response.ok) {
          setStatusMessage(
            result.message || "Failed to load transport requests.",
          );
          setStatusType("error");
          return;
        }

        const loadedRequests = result.data || [];

        setRequests(loadedRequests);
        setSelectedRequest(loadedRequests[0] || null);
      } catch (error) {
        console.error("Offer requests fetch error:", error);
        setStatusMessage("Could not connect to the FastTrans server.");
        setStatusType("error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Updates offer form inputs as Amanda edits the offer values.
  const handleOfferChange = (event) => {
    const { name, value } = event.target;

    setOfferData((currentOfferData) => ({
      ...currentOfferData,
      [name]: value,
    }));

    if (statusMessage) {
      setStatusMessage("");
      setStatusType("");
    }
  };

  // Stores the selected client request for offer generation.
  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setGeneratedOffer(null);
    setStatusMessage("");
    setStatusType("");
  };

  const basePrice = Number(offerData.basePrice) || 0;
  const tax = Number(offerData.tax) || 0;
  const discount = Number(offerData.discount) || 0;
  const totalOfferAmount = Math.max(basePrice + tax - discount, 0);

  // Creates an offer and saves it in localStorage for client review.
  const handleGenerateOffer = () => {
    if (!selectedRequest) {
      setStatusMessage("Select a client request before generating an offer.");
      setStatusType("error");
      return;
    }

    const newOffer = {
      id: `OFFER-${Date.now()}`,
      requestId: selectedRequest.id,
      request: {
        pickupLocation: selectedRequest.pickupLocation,
        destination: selectedRequest.destination,
        packageType: selectedRequest.packageType,
        weight: selectedRequest.weight,
        pickupDate: selectedRequest.pickupDate,
        pickupTime: selectedRequest.pickupTime,
        instructions: selectedRequest.instructions,
      },
      pricing: {
        basePrice,
        tax,
        discount,
        totalAmount: totalOfferAmount,
      },
      estimatedDistance: offerData.estimatedDistance,
      estimatedDuration: offerData.estimatedDuration,
      vehicleMatch: offerData.vehicleMatch,
      notes: offerData.notes,
      status: "sent",
      schedulingStatus: "waiting_for_client_response",
      createdAt: new Date().toISOString(),
    };

    const savedOffers = JSON.parse(
      localStorage.getItem(OFFERS_STORAGE_KEY) || "[]",
    );

    localStorage.setItem(
      OFFERS_STORAGE_KEY,
      JSON.stringify([newOffer, ...savedOffers]),
    );

    setGeneratedOffer(newOffer);
    setStatusMessage("Transport offer generated and sent for client review.");
    setStatusType("success");
  };

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Amanda Module
          </p>
          <h2 className="mt-1 text-3xl font-bold">Offer Management</h2>
          <p className="mt-1 text-slate-600">
            Generate transport offers for submitted client requests.
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

        {generatedOffer && (
          <section className="mb-8 rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Offer Generated
                </p>
                <h3 className="mt-1 text-2xl font-bold">
                  Offer Ready for Client Review
                </h3>
                <p className="mt-1 text-slate-600">
                  The offer has been saved and can now be accepted or rejected
                  by the client.
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {generatedOffer.status}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Offer ID</p>
                <p className="mt-1 break-all font-semibold">
                  {generatedOffer.id}
                </p>
              </div>

              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Route</p>
                <p className="mt-1 font-semibold">
                  {generatedOffer.request.pickupLocation} to{" "}
                  {generatedOffer.request.destination}
                </p>
              </div>

              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Total Offer</p>
                <p className="mt-1 font-semibold">
                  KES {generatedOffer.pricing.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/offers/review"
                className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Open Client Review
              </Link>
            </div>
          </section>
        )}

        <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-xl font-bold">Submitted Requests</h3>
              <p className="mt-1 text-sm text-slate-600">
                Select a request to prepare a transport offer.
              </p>
            </div>

            {isLoading ? (
              <p className="px-6 py-8 text-slate-600">Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="px-6 py-8 text-slate-600">
                No submitted requests are available for offer generation.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => handleSelectRequest(request)}
                    className={`block w-full px-6 py-4 text-left hover:bg-slate-50 ${
                      selectedRequest?.id === request.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">
                          {request.pickupLocation} to {request.destination}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {request.packageType} - {request.weight} kg
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {request.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-8">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-xl font-bold">Generate Offer</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Enter offer pricing, vehicle match, and delivery estimates.
                </p>
              </div>

              <div className="grid gap-6 p-6">
                {selectedRequest ? (
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-600">
                      Selected Request
                    </p>
                    <p className="mt-1 font-bold">
                      {selectedRequest.pickupLocation} to{" "}
                      {selectedRequest.destination}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedRequest.packageType} - {selectedRequest.weight}{" "}
                      kg
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">
                    Select a request before generating an offer.
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Base Price (KES)
                    </label>
                    <input
                      type="number"
                      name="basePrice"
                      value={offerData.basePrice}
                      onChange={handleOfferChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Tax (KES)
                    </label>
                    <input
                      type="number"
                      name="tax"
                      value={offerData.tax}
                      onChange={handleOfferChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Discount (KES)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={offerData.discount}
                      onChange={handleOfferChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Vehicle Match
                    </label>
                    <select
                      name="vehicleMatch"
                      value={offerData.vehicleMatch}
                      onChange={handleOfferChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                    >
                      <option>Truck</option>
                      <option>Van</option>
                      <option>Pickup</option>
                      <option>Refrigerated Truck</option>
                      <option>Heavy Cargo Trailer</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Estimated Distance (km)
                    </label>
                    <input
                      type="number"
                      name="estimatedDistance"
                      value={offerData.estimatedDistance}
                      onChange={handleOfferChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-800">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      name="estimatedDuration"
                      value={offerData.estimatedDuration}
                      onChange={handleOfferChange}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Offer Notes
                  </label>
                  <textarea
                    name="notes"
                    value={offerData.notes}
                    onChange={handleOfferChange}
                    rows="4"
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={handleGenerateOffer}
                    className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Generate Offer
                  </button>
                </div>
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">Generated Offer Preview</h3>
              <p className="mt-1 text-sm text-slate-600">
                This preview shows what will be displayed to the client.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-700">
                    Total Offer Amount
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    KES {totalOfferAmount.toLocaleString()}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Base Price</p>
                    <p className="font-semibold">
                      KES {basePrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Tax</p>
                    <p className="font-semibold">KES {tax.toLocaleString()}</p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Discount</p>
                    <p className="font-semibold">
                      KES {discount.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Vehicle</p>
                    <p className="font-semibold">{offerData.vehicleMatch}</p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Distance</p>
                    <p className="font-semibold">
                      {offerData.estimatedDistance} km
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Duration</p>
                    <p className="font-semibold">
                      {offerData.estimatedDuration}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm text-slate-600">Notes</p>
                  <p className="mt-1 font-semibold">{offerData.notes}</p>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

export default OfferManagementPage;
