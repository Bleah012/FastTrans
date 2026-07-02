import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  CheckCircle2,
  ClipboardList,
  FileText,
  PackageCheck,
  RefreshCw,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";
import AdminAreaNotice, { hasAdminAccess } from "../components/AdminAreaNotice";
import { API_ENDPOINTS } from "../config/api";

const OFFERS_STORAGE_KEY = "fasttrans-generated-offers";

const defaultOfferForm = {
  offerAmount: "",
  serviceFee: "",
  discount: "0",
  vehicleType: "Truck",
  distance: "485 km",
  duration: "7h 20m",
  notes: "Offer includes standard pickup, transport, and delivery handling.",
};

function readStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function OfferManagementPage() {
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offerForm, setOfferForm] = useState(defaultOfferForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);

  const canAccessAdminArea = hasAdminAccess();

  const showStatus = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const saveOffers = (nextOffers) => {
    setOffers(nextOffers);
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(nextOffers));
  };

  const loadRequests = async () => {
    if (!canAccessAdminArea) {
      return;
    }

    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.requests);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load requests.");
      }

      const requestData = result.data || [];
      setRequests(requestData);
      setSelectedRequest(requestData[0] || null);
      showStatus("Submitted requests loaded successfully.");
    } catch (error) {
      showStatus(error.message || "Failed to load requests.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccessAdminArea) {
      return;
    }

    setOffers(readStorage(OFFERS_STORAGE_KEY, []));
    loadRequests();
  }, [canAccessAdminArea]);

  const approvedRequests = useMemo(
    () => requests.filter((request) => request.status === "approved"),
    [requests],
  );

  const offerStats = useMemo(
    () => ({
      total: offers.length,
      sent: offers.filter((offer) => offer.status === "sent").length,
      accepted: offers.filter((offer) => offer.status === "accepted").length,
      rejected: offers.filter((offer) => offer.status === "rejected").length,
    }),
    [offers],
  );

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);

    const weight = Number(request.weight) || 0;
    const vehicleType =
      weight > 5000
        ? "Heavy Cargo Trailer"
        : weight > 1500
          ? "Truck"
          : weight > 500
            ? "Van"
            : "Pickup";

    const baseAmount = Math.round(2500 + weight * 90 + 485 * 6);

    setOfferForm({
      ...defaultOfferForm,
      offerAmount: String(baseAmount),
      serviceFee: "500",
      vehicleType,
    });
  };

  const handleOfferFormChange = (event) => {
    const { name, value } = event.target;

    setOfferForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleGenerateOffer = (event) => {
    event.preventDefault();

    if (!selectedRequest) {
      showStatus("Select a request before generating an offer.", "error");
      return;
    }

    if (!offerForm.offerAmount || Number(offerForm.offerAmount) <= 0) {
      showStatus("Enter a valid offer amount.", "error");
      return;
    }

    const newOffer = {
      id: `OFFER-${Date.now()}`,
      requestId: selectedRequest.id,
      client: selectedRequest.client,
      clientName: selectedRequest.clientName,
      clientEmail: selectedRequest.clientEmail,
      pickupLocation: selectedRequest.pickupLocation,
      destination: selectedRequest.destination,
      route: `${selectedRequest.pickupLocation} to ${selectedRequest.destination}`,
      packageType: selectedRequest.packageType,
      weight: selectedRequest.weight,
      pickupDate: selectedRequest.pickupDate,
      pickupTime: selectedRequest.pickupTime,
      offerAmount: Number(offerForm.offerAmount),
      serviceFee: Number(offerForm.serviceFee) || 0,
      discount: Number(offerForm.discount) || 0,
      vehicleType: offerForm.vehicleType,
      distance: offerForm.distance,
      duration: offerForm.duration,
      notes: offerForm.notes,
      status: "sent",
      schedulingStatus: "waiting for client",
      createdAt: new Date().toISOString(),
    };

    saveOffers([newOffer, ...offers]);
    setOfferForm(defaultOfferForm);
    showStatus("Offer generated and sent to the client review page.");
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const getStatusClass = (status) => {
    if (status === "accepted") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    if (status === "approved") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-blue-50 text-blue-700";
  };

  if (!canAccessAdminArea) {
    return (
      <main className="px-6 py-8 text-slate-950">
        <section className="mx-auto max-w-7xl">
          <AdminAreaNotice
            title="Offer Management Access"
            description="Login as an admin or manager before generating, sending, or managing transport offers."
          />
        </section>
      </main>
    );
  }

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <AdminAreaNotice
          title="Offer Management Access"
          description="Login as an admin or manager before generating, sending, or managing transport offers."
        />

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Amanda Module
            </p>
            <h1 className="mt-2 text-3xl font-black">Offer Management</h1>
            <p className="mt-2 text-slate-600">
              Generate transport offers for approved client requests and send
              them to the correct client account.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadRequests}
              className="inline-flex items-center gap-2 rounded-md border border-blue-700 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <RefreshCw size={18} />
              {isLoading ? "Refreshing..." : "Refresh Requests"}
            </button>

            <Link
              to="/offers/review"
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <PackageCheck size={18} />
              Review Offers
            </Link>
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

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            ["Total Offers", offerStats.total, FileText, "text-slate-950"],
            ["Sent Offers", offerStats.sent, Send, "text-blue-700"],
            ["Accepted", offerStats.accepted, CheckCircle2, "text-emerald-700"],
            ["Rejected", offerStats.rejected, ShieldCheck, "text-red-700"],
          ].map(([label, value, Icon, color]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{label}</p>
                <Icon size={22} className="text-blue-700" />
              </div>
              <p className={`mt-4 text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold">Approved Client Requests</h2>
              <p className="mt-1 text-sm text-slate-600">
                Select an approved request to prepare and send a transport
                offer.
              </p>
            </div>

            <div className="max-h-[620px] overflow-y-auto">
              {approvedRequests.map((request) => {
                const isSelected = selectedRequest?.id === request.id;

                return (
                  <button
                    type="button"
                    key={request.id}
                    onClick={() => handleSelectRequest(request)}
                    className={`block w-full border-b border-slate-100 p-5 text-left transition hover:bg-blue-50 ${
                      isSelected ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">
                          {request.pickupLocation} to {request.destination}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {request.packageType} - {request.weight} kg
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {request.clientName || "Unknown client"} -{" "}
                          {request.clientEmail || "No email"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusClass(
                          request.status,
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </button>
                );
              })}

              {approvedRequests.length === 0 && (
                <div className="p-6 text-center text-slate-600">
                  No approved requests are ready for offer generation.
                </div>
              )}
            </div>
          </section>

          <form
            onSubmit={handleGenerateOffer}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold">Generate Offer</h2>
              <p className="mt-1 text-sm text-slate-600">
                Enter pricing, vehicle match, and delivery estimates.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              {selectedRequest ? (
                <div className="rounded-lg bg-slate-100 p-5">
                  <p className="text-sm font-semibold text-slate-600">
                    Selected Request
                  </p>
                  <p className="mt-2 font-bold">
                    {selectedRequest.pickupLocation} to{" "}
                    {selectedRequest.destination}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedRequest.packageType} - {selectedRequest.weight} kg
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {selectedRequest.clientName || "Unknown client"} -{" "}
                    {selectedRequest.clientEmail || "No email"}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-amber-50 p-5 text-sm font-semibold text-amber-700">
                  Select an approved request to generate an offer.
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Offer Amount
                  <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 px-4 py-3">
                    <BadgeDollarSign size={18} className="text-slate-400" />
                    <input
                      type="number"
                      name="offerAmount"
                      value={offerForm.offerAmount}
                      onChange={handleOfferFormChange}
                      className="w-full bg-transparent outline-none"
                      placeholder="7500"
                    />
                  </div>
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Service Fee
                  <input
                    type="number"
                    name="serviceFee"
                    value={offerForm.serviceFee}
                    onChange={handleOfferFormChange}
                    className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    placeholder="500"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Discount
                  <input
                    type="number"
                    name="discount"
                    value={offerForm.discount}
                    onChange={handleOfferFormChange}
                    className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    placeholder="0"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Vehicle Type
                  <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 px-4 py-3">
                    <Truck size={18} className="text-slate-400" />
                    <select
                      name="vehicleType"
                      value={offerForm.vehicleType}
                      onChange={handleOfferFormChange}
                      className="w-full bg-transparent outline-none"
                    >
                      <option value="Pickup">Pickup</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Refrigerated Truck">
                        Refrigerated Truck
                      </option>
                      <option value="Heavy Cargo Trailer">
                        Heavy Cargo Trailer
                      </option>
                    </select>
                  </div>
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Distance
                  <input
                    type="text"
                    name="distance"
                    value={offerForm.distance}
                    onChange={handleOfferFormChange}
                    className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Duration
                  <input
                    type="text"
                    name="duration"
                    value={offerForm.duration}
                    onChange={handleOfferFormChange}
                    className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  />
                </label>
              </div>

              <label className="text-sm font-semibold text-slate-700">
                Offer Notes
                <textarea
                  name="notes"
                  value={offerForm.notes}
                  onChange={handleOfferFormChange}
                  rows="5"
                  className="mt-2 w-full resize-y rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-fit items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                <Send size={18} />
                Generate and Send Offer
              </button>
            </div>
          </form>
        </div>

        <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold">Generated Offers</h2>
            <p className="mt-1 text-sm text-slate-600">
              Offers are stored locally for the client review workflow.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-4">Offer ID</th>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold">{offer.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {offer.clientName || "Unknown client"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {offer.clientEmail || "No email"}
                      </p>
                    </td>
                    <td className="px-5 py-4">{offer.route}</td>
                    <td className="px-5 py-4">{offer.vehicleType}</td>
                    <td className="px-5 py-4">
                      {formatCurrency(offer.offerAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusClass(
                          offer.status,
                        )}`}
                      >
                        {offer.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {offers.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-6 text-center text-slate-600"
                    >
                      No offers have been generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default OfferManagementPage;
