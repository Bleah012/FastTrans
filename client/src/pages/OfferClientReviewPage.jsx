import { useEffect, useState } from "react";

const OFFERS_STORAGE_KEY = "fasttrans-generated-offers";

const offerStatusFilters = ["all", "sent", "accepted", "rejected"];

function OfferClientReviewPage() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  // Loads generated offers from localStorage for client review.
  useEffect(() => {
    const savedOffers = JSON.parse(
      localStorage.getItem(OFFERS_STORAGE_KEY) || "[]",
    );

    setOffers(savedOffers);
    setSelectedOffer(savedOffers[0] || null);
  }, []);

  // Stores the selected offer so the client can view its details.
  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
    setStatusMessage("");
    setStatusType("");
  };

  // Clears search and status filter controls.
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Clears generated offers from localStorage for demo reset.
  const handleClearOffers = () => {
    localStorage.removeItem(OFFERS_STORAGE_KEY);
    setOffers([]);
    setSelectedOffer(null);
    setSearchTerm("");
    setStatusFilter("all");
    setStatusMessage("Generated offers cleared successfully.");
    setStatusType("success");
  };

  // Updates offer status after the client accepts or rejects it.
  const handleOfferResponse = (offerToUpdate, responseStatus) => {
    if (!offerToUpdate) {
      setStatusMessage("Select an offer before responding.");
      setStatusType("error");
      return;
    }

    const updatedOffer = {
      ...offerToUpdate,
      status: responseStatus,
      schedulingStatus:
        responseStatus === "accepted"
          ? "ready_for_scheduling"
          : "client_rejected_offer",
      respondedAt: new Date().toISOString(),
    };

    const updatedOffers = offers.map((offer) =>
      offer.id === offerToUpdate.id ? updatedOffer : offer,
    );

    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(updatedOffers));
    setOffers(updatedOffers);
    setSelectedOffer(updatedOffer);

    setStatusMessage(
      responseStatus === "accepted"
        ? "Offer accepted. It is ready for the scheduling module."
        : "Offer rejected. Amanda can generate a revised offer if needed.",
    );
    setStatusType(responseStatus === "accepted" ? "success" : "error");
  };

  // Gives offer statuses clear visual styling.
  const getStatusBadgeClass = (status) => {
    if (status === "accepted") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    return "bg-blue-50 text-blue-700";
  };

  // Makes status labels easier to read.
  const formatStatusLabel = (status) => {
    return String(status || "unknown").replaceAll("_", " ");
  };

  // Filters offers by search text and offer status.
  const filteredOffers = offers.filter((offer) => {
    const searchText = searchTerm.toLowerCase();

    const matchesSearch =
      offer.id.toLowerCase().includes(searchText) ||
      offer.request.pickupLocation.toLowerCase().includes(searchText) ||
      offer.request.destination.toLowerCase().includes(searchText) ||
      offer.vehicleMatch.toLowerCase().includes(searchText) ||
      offer.status.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" || offer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeOffer =
    selectedOffer &&
    filteredOffers.some((offer) => offer.id === selectedOffer.id)
      ? selectedOffer
      : filteredOffers[0] || null;

  const acceptedOffers = offers.filter((offer) => offer.status === "accepted");
  const sentCount = offers.filter((offer) => offer.status === "sent").length;
  const acceptedCount = acceptedOffers.length;
  const rejectedCount = offers.filter(
    (offer) => offer.status === "rejected",
  ).length;
  const readyForSchedulingCount = offers.filter(
    (offer) => offer.schedulingStatus === "ready_for_scheduling",
  ).length;

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Amanda Module
            </p>
            <h2 className="mt-1 text-3xl font-bold">Client Offer Review</h2>
            <p className="mt-1 text-slate-600">
              Review generated transport offers and accept or reject them.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearOffers}
            className="w-fit rounded-md border border-red-600 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Clear Offers
          </button>
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

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Total Offers</p>
            <p className="mt-2 text-3xl font-bold">{offers.length}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Sent Offers</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{sentCount}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Accepted Offers
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {acceptedCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Rejected Offers
            </p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {rejectedCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Ready for Scheduling
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {readyForSchedulingCount}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-bold">
              Accepted Offers for Scheduling
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Accepted offers are ready to be passed to the scheduling module.
            </p>
          </div>

          {acceptedOffers.length === 0 ? (
            <p className="px-6 py-8 text-slate-600">
              No accepted offers are ready for scheduling yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Offer ID
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Route
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Vehicle
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Amount
                    </th>
                    <th className="border-b border-slate-200 px-6 py-3">
                      Scheduling Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {acceptedOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-6 py-4 font-semibold">
                        {offer.id}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {offer.request.pickupLocation} to{" "}
                        {offer.request.destination}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        {offer.vehicleMatch}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        KES {offer.pricing.totalAmount.toLocaleString()}
                      </td>
                      <td className="border-b border-slate-100 px-6 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {formatStatusLabel(offer.schedulingStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1fr_1.3fr]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-xl font-bold">Generated Offers</h3>
              <p className="mt-1 text-sm text-slate-600">
                Search, filter, and select an offer to review.
              </p>
            </div>

            <div className="grid gap-4 border-b border-slate-200 px-6 py-5 lg:grid-cols-[2fr_1fr_auto] lg:items-end">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Search Offers
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search route, offer ID, vehicle, or status"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700"
                >
                  {offerStatusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status === "all"
                        ? "All Offers"
                        : formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                  {filteredOffers.length} of {offers.length} shown
                </span>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {filteredOffers.length === 0 ? (
              <p className="px-6 py-8 text-slate-600">
                No offers match your current search or filter.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredOffers.map((offer) => (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => handleSelectOffer(offer)}
                    className={`block w-full px-6 py-4 text-left hover:bg-slate-50 ${
                      activeOffer?.id === offer.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">
                          {offer.request.pickupLocation} to{" "}
                          {offer.request.destination}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          KES {offer.pricing.totalAmount.toLocaleString()} -{" "}
                          {offer.vehicleMatch}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          offer.status,
                        )}`}
                      >
                        {formatStatusLabel(offer.status)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-xl font-bold">Offer Details</h3>
              <p className="mt-1 text-sm text-slate-600">
                The client can accept or reject the selected offer.
              </p>
            </div>

            {activeOffer ? (
              <div className="p-6">
                <div className="flex flex-col gap-4 rounded-md bg-blue-50 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700">
                      Offer Amount
                    </p>
                    <p className="mt-1 text-3xl font-bold">
                      KES {activeOffer.pricing.totalAmount.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Offer ID: {activeOffer.id}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass(
                      activeOffer.status,
                    )}`}
                  >
                    {formatStatusLabel(activeOffer.status)}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Pickup Location</p>
                    <p className="mt-1 font-semibold">
                      {activeOffer.request.pickupLocation}
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Destination</p>
                    <p className="mt-1 font-semibold">
                      {activeOffer.request.destination}
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Package</p>
                    <p className="mt-1 font-semibold">
                      {activeOffer.request.packageType} -{" "}
                      {activeOffer.request.weight} kg
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Pickup Schedule</p>
                    <p className="mt-1 font-semibold">
                      {activeOffer.request.pickupDate} at{" "}
                      {activeOffer.request.pickupTime}
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Vehicle Match</p>
                    <p className="mt-1 font-semibold">
                      {activeOffer.vehicleMatch}
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">
                      Distance / Duration
                    </p>
                    <p className="mt-1 font-semibold">
                      {activeOffer.estimatedDistance} km -{" "}
                      {activeOffer.estimatedDuration}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-md border border-slate-200 p-4">
                  <p className="text-sm text-slate-600">Offer Notes</p>
                  <p className="mt-1 font-semibold">{activeOffer.notes}</p>
                </div>

                <div className="mt-6 rounded-md border border-slate-200 p-4">
                  <p className="text-sm text-slate-600">Scheduling Status</p>
                  <p className="mt-1 font-semibold">
                    {formatStatusLabel(activeOffer.schedulingStatus)}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    disabled={activeOffer.status === "accepted"}
                    onClick={() => handleOfferResponse(activeOffer, "accepted")}
                    className="rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    Accept Offer
                  </button>

                  <button
                    type="button"
                    disabled={activeOffer.status === "rejected"}
                    onClick={() => handleOfferResponse(activeOffer, "rejected")}
                    className="rounded-md border border-red-600 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                  >
                    Reject Offer
                  </button>
                </div>
              </div>
            ) : (
              <p className="p-6 text-slate-600">
                Select an offer to review its details.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default OfferClientReviewPage;
