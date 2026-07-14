import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import { getAuthUser } from "../config/auth";
import {
  ACCEPTED_OFFERS_STORAGE_KEY,
  OFFERS_STORAGE_KEY,
  applyOfferDecision,
  getOfferStatus,
  persistAcceptedOffer,
  readStorage,
} from "../utils/offerManagement";

function OfferClientReviewPage() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  const authUser = getAuthUser();
  const isAdmin = authUser?.role === "admin" || authUser?.role === "manager";

  const getOfferAmount = (offer) =>
    Number(offer.offerAmount || offer.amount || offer.totalAmount || 0);

  const getOfferRoute = (offer) =>
    offer.route ||
    `${offer.pickupLocation || "Pickup"} to ${offer.destination || "Destination"}`;

  const getOfferVehicle = (offer) =>
    offer.vehicleType || offer.vehicle || offer.vehicleMatch || "Truck";

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const showStatus = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const visibleOffers = useMemo(() => {
    if (isAdmin) {
      return offers;
    }

    return offers.filter(
      (offer) =>
        offer.clientEmail?.toLowerCase() === authUser?.email?.toLowerCase(),
    );
  }, [offers, authUser?.email, isAdmin]);

  const filteredOffers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return visibleOffers.filter((offer) => {
      const status = getOfferStatus(offer);

      const matchesSearch =
        !normalizedSearch ||
        offer.id?.toLowerCase().includes(normalizedSearch) ||
        offer.offerId?.toLowerCase().includes(normalizedSearch) ||
        getOfferRoute(offer).toLowerCase().includes(normalizedSearch) ||
        getOfferVehicle(offer).toLowerCase().includes(normalizedSearch) ||
        offer.clientName?.toLowerCase().includes(normalizedSearch) ||
        offer.clientEmail?.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [visibleOffers, searchTerm, statusFilter]);

  const totals = useMemo(
    () => ({
      total: visibleOffers.length,
      sent: visibleOffers.filter((offer) => getOfferStatus(offer) === "sent")
        .length,
      accepted: visibleOffers.filter(
        (offer) => getOfferStatus(offer) === "accepted",
      ).length,
      rejected: visibleOffers.filter(
        (offer) => getOfferStatus(offer) === "rejected",
      ).length,
      readyForScheduling: visibleOffers.filter(
        (offer) => getOfferStatus(offer) === "accepted",
      ).length,
    }),
    [visibleOffers],
  );

  const loadOffers = () => {
    const savedOffers = readStorage(OFFERS_STORAGE_KEY, []);

    setOffers(savedOffers);

    const nextVisibleOffers = isAdmin
      ? savedOffers
      : savedOffers.filter(
          (offer) =>
            offer.clientEmail?.toLowerCase() === authUser?.email?.toLowerCase(),
        );

    setSelectedOffer(nextVisibleOffers[0] || null);

    showStatus(
      isAdmin
        ? "All generated offers loaded successfully."
        : "Your generated offers loaded successfully.",
    );
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const saveOffers = (nextOffers) => {
    setOffers(nextOffers);
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(nextOffers));
  };

  const saveAcceptedOfferForAvailability = (offer) => {
    const acceptedOffers = readStorage(ACCEPTED_OFFERS_STORAGE_KEY, []);
    const nextAcceptedOffers = persistAcceptedOffer(offer, acceptedOffers);

    localStorage.setItem(
      ACCEPTED_OFFERS_STORAGE_KEY,
      JSON.stringify(nextAcceptedOffers),
    );
  };

  const handleOfferDecision = (offerId, status) => {
    const selected = offers.find(
      (offer) => offer.id === offerId || offer.offerId === offerId,
    );

    if (!selected) {
      showStatus("Offer not found.", "error");
      return;
    }

    if (!isAdmin && selected.clientEmail !== authUser?.email) {
      showStatus("You can only update offers linked to your account.", "error");
      return;
    }

    const { updatedOffer, nextOffers, shouldPersistAcceptedOffer } =
      applyOfferDecision(offers, offerId, status);

    if (!updatedOffer) {
      showStatus("Offer not found.", "error");
      return;
    }

    saveOffers(nextOffers);
    setSelectedOffer(updatedOffer);

    if (shouldPersistAcceptedOffer) {
      saveAcceptedOfferForAvailability(updatedOffer);
      showStatus("Offer accepted and marked ready for availability check.");
      return;
    }

    showStatus("Offer rejected successfully.", "error");
  };

  const handleClearOffers = () => {
    if (!isAdmin) {
      showStatus(
        "Only admin or manager accounts can clear all offers.",
        "error",
      );
      return;
    }

    localStorage.removeItem(OFFERS_STORAGE_KEY);
    localStorage.removeItem(ACCEPTED_OFFERS_STORAGE_KEY);
    setOffers([]);
    setSelectedOffer(null);
    showStatus("All offers cleared successfully.");
  };

  const getStatusClass = (status) => {
    if (status === "accepted") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    return "bg-blue-50 text-blue-700";
  };

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Amanda Module
            </p>
            <h1 className="mt-2 text-3xl font-black">
              {isAdmin ? "Client Offer Review" : "My Offer Review"}
            </h1>
            <p className="mt-2 text-slate-600">
              {isAdmin
                ? "Review generated transport offers across all clients."
                : "Review generated transport offers linked to your own account."}
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
              onClick={loadOffers}
              className="inline-flex items-center gap-2 rounded-md border border-blue-700 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={handleClearOffers}
                className="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                <Trash2 size={18} />
                Clear Offers
              </button>
            )}
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

        <div className="mb-8 grid gap-4 md:grid-cols-5">
          {[
            ["Total Offers", totals.total, ClipboardCheck, "text-slate-950"],
            ["Sent Offers", totals.sent, PackageCheck, "text-blue-700"],
            [
              "Accepted Offers",
              totals.accepted,
              CheckCircle2,
              "text-emerald-700",
            ],
            ["Rejected Offers", totals.rejected, XCircle, "text-red-700"],
            [
              "Ready for Scheduling",
              totals.readyForScheduling,
              CalendarClock,
              "text-emerald-700",
            ],
          ].map(([label, value, Icon, color]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">{label}</p>
                <Icon size={22} className="text-blue-700" />
              </div>
              <p className={`mt-4 text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <section className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold">
              Accepted Offers for Scheduling
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Accepted offers are ready to be passed to the vehicle availability
              and scheduling modules.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-4">Offer ID</th>
                  {isAdmin && <th className="px-5 py-4">Client</th>}
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Scheduling Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleOffers
                  .filter((offer) => getOfferStatus(offer) === "accepted")
                  .map((offer) => (
                    <tr
                      key={offer.id || offer.offerId}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {offer.id || offer.offerId}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {offer.clientName || "Unknown client"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {offer.clientEmail || "No email"}
                          </p>
                        </td>
                      )}
                      <td className="px-5 py-4">{getOfferRoute(offer)}</td>
                      <td className="px-5 py-4">{getOfferVehicle(offer)}</td>
                      <td className="px-5 py-4">
                        {formatCurrency(getOfferAmount(offer))}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {offer.schedulingStatus || "ready for scheduling"}
                        </span>
                      </td>
                    </tr>
                  ))}

                {visibleOffers.filter(
                  (offer) => getOfferStatus(offer) === "accepted",
                ).length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdmin ? "6" : "5"}
                      className="px-5 py-6 text-center text-slate-600"
                    >
                      No accepted offers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold">
                {isAdmin ? "Generated Offers" : "My Generated Offers"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Search, filter, and select an offer to review.
              </p>
            </div>

            <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-[1fr_170px_auto]">
              <label className="flex items-center gap-3 rounded-md border border-slate-300 px-4 py-3">
                <Search size={18} className="text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Search route, offer ID, vehicle, or client"
                />
              </label>

              <label className="flex items-center gap-3 rounded-md border border-slate-300 px-4 py-3">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full bg-transparent outline-none"
                >
                  <option value="all">All Offers</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>

              <div className="rounded-md bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700">
                {filteredOffers.length} of {visibleOffers.length} shown
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {filteredOffers.map((offer) => {
                const offerId = offer.id || offer.offerId;
                const isSelected =
                  selectedOffer?.id === offerId ||
                  selectedOffer?.offerId === offerId;

                return (
                  <button
                    type="button"
                    key={offerId}
                    onClick={() => setSelectedOffer(offer)}
                    className={`block w-full border-b border-slate-100 p-5 text-left transition hover:bg-blue-50 ${
                      isSelected ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{offerId}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {getOfferRoute(offer)}
                        </p>
                        {isAdmin && (
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {offer.clientName || "Unknown client"} -{" "}
                            {offer.clientEmail || "No email"}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusClass(
                          getOfferStatus(offer),
                        )}`}
                      >
                        {getOfferStatus(offer)}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredOffers.length === 0 && (
                <p className="p-6 text-center text-slate-600">
                  No offers found for this account.
                </p>
              )}
            </div>
          </section>

          <section className="h-fit rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold">Offer Details</h2>
              <p className="mt-1 text-sm text-slate-600">
                The client can accept or reject the selected offer.
              </p>
            </div>

            {!selectedOffer ? (
              <div className="p-6 text-slate-600">
                Select an offer to view details.
              </div>
            ) : (
              <div className="grid gap-5 p-6">
                <div className="rounded-lg bg-blue-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-700">
                        Offer Amount
                      </p>
                      <p className="mt-2 text-4xl font-black">
                        {formatCurrency(getOfferAmount(selectedOffer))}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Offer ID: {selectedOffer.id || selectedOffer.offerId}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusClass(
                        getOfferStatus(selectedOffer),
                      )}`}
                    >
                      {getOfferStatus(selectedOffer)}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="rounded-lg border border-slate-200 p-5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="text-blue-700" size={22} />
                      <div>
                        <p className="font-bold">
                          {selectedOffer.clientName || "Unknown client"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {selectedOffer.clientEmail || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-5">
                    <Truck className="text-blue-700" size={24} />
                    <p className="mt-3 text-sm text-slate-500">Vehicle Match</p>
                    <p className="font-bold">
                      {getOfferVehicle(selectedOffer)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-5">
                    <BadgeDollarSign className="text-blue-700" size={24} />
                    <p className="mt-3 text-sm text-slate-500">Service Fee</p>
                    <p className="font-bold">
                      {formatCurrency(selectedOffer.serviceFee || 0)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Route</p>
                  <p className="mt-1 font-bold">
                    {getOfferRoute(selectedOffer)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedOffer.distance || "485 km"} -{" "}
                    {selectedOffer.duration || "7h 20m"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Offer Notes</p>
                  <p className="mt-1 font-semibold">
                    {selectedOffer.notes ||
                      "Offer includes pickup, transportation, handling, and delivery coordination."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleOfferDecision(
                        selectedOffer.id || selectedOffer.offerId,
                        "accepted",
                      )
                    }
                    disabled={getOfferStatus(selectedOffer) === "accepted"}
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <CheckCircle2 size={18} />
                    Accept Offer
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleOfferDecision(
                        selectedOffer.id || selectedOffer.offerId,
                        "rejected",
                      )
                    }
                    disabled={getOfferStatus(selectedOffer) === "rejected"}
                    className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <XCircle size={18} />
                    Reject Offer
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default OfferClientReviewPage;
