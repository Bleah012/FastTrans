import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";

const statusActions = [
  { label: "Approve", value: "approved" },
  { label: "Assign", value: "assigned" },
  { label: "Complete", value: "completed" },
  { label: "Cancel", value: "cancelled" },
];

const statusFilters = [
  "all",
  "pending",
  "approved",
  "assigned",
  "completed",
  "cancelled",
];

function RequestsListPage({ onNewRequest }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  // Fetches all transport requests from the Express server.
  const fetchRequests = async () => {
    setIsLoading(true);
    setStatusMessage("");

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
      setStatusMessage("Requests loaded successfully.");
      setStatusType("success");
    } catch (error) {
      console.error("Fetch requests error:", error);
      setStatusMessage("Could not connect to the FastTrans server.");
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Loads requests automatically when this page opens.
  useEffect(() => {
    fetchRequests();
  }, []);

  // Converts the saved request date into a readable date and time.
  const formatCreatedDate = (createdAt) => {
    if (!createdAt) {
      return "Not available";
    }

    return new Date(createdAt).toLocaleString();
  };

  // Stores the clicked request so its full details can be shown.
  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
  };

  // Sends the new request status to the backend and updates the page immediately.
  const handleStatusUpdate = async (requestId, newStatus) => {
    setIsUpdatingStatus(true);
    setStatusMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.requestStatus(requestId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatusMessage(result.message || "Failed to update request status.");
        setStatusType("error");
        return;
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === result.data.id ? result.data : request,
        ),
      );

      setSelectedRequest(result.data);
      setStatusMessage("Request status updated successfully.");
      setStatusType("success");
    } catch (error) {
      console.error("Update status error:", error);
      setStatusMessage("Could not connect to the FastTrans server.");
      setStatusType("error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Clears search and filter controls.
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Gives each request status a clear visual style.
  const getStatusBadgeClass = (status) => {
    if (status === "approved") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "assigned") {
      return "bg-blue-50 text-blue-700";
    }

    if (status === "completed") {
      return "bg-slate-100 text-slate-700";
    }

    if (status === "cancelled") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  // Makes status text clean for display.
  const formatStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filters requests by search text and selected status.
  const filteredRequests = requests.filter((request) => {
    const searchText = searchTerm.toLowerCase();

    const matchesSearch =
      request.pickupLocation.toLowerCase().includes(searchText) ||
      request.destination.toLowerCase().includes(searchText) ||
      request.packageType.toLowerCase().includes(searchText) ||
      request.status.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeRequest =
    selectedRequest &&
    filteredRequests.some((request) => request.id === selectedRequest.id)
      ? selectedRequest
      : filteredRequests[0] || null;

  const pendingCount = requests.filter(
    (request) => request.status === "pending",
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "completed",
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Client Request Records
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-950">
                FastTrans Requests
              </h1>
              <p className="mt-1 text-slate-600">
                Review submitted client transport requests and update their
                progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchRequests}
                className="rounded-md border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={onNewRequest}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                New Request
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Total Requests
            </p>
            <p className="mt-2 text-3xl font-bold">{requests.length}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Pending Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Completed Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {completedCount}
            </p>
          </div>
        </section>

        {statusMessage && (
          <div
            className={`mb-5 rounded-md px-4 py-3 text-sm font-medium ${
              statusType === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold">
                Submitted Transport Requests
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Search, filter, and select a request to view full details.
              </p>
            </div>

            <div className="grid gap-4 border-b border-slate-200 px-6 py-5 lg:grid-cols-[2fr_1fr_auto] lg:items-end">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Search Requests
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search pickup, destination, package, or status"
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
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status === "all"
                        ? "All Statuses"
                        : formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                  {filteredRequests.length} of {requests.length} shown
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

            {isLoading ? (
              <p className="px-6 py-10 text-slate-600">Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="px-6 py-10 text-slate-600">
                No requests match your current search or filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
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
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        onClick={() => handleSelectRequest(request)}
                        className={`cursor-pointer ${
                          activeRequest?.id === request.id
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="border-b border-slate-100 px-6 py-4">
                          <p className="font-semibold">
                            {request.pickupLocation}
                          </p>
                          <p className="mt-1 text-slate-600">
                            to {request.destination}
                          </p>
                        </td>

                        <td className="border-b border-slate-100 px-6 py-4">
                          <p className="font-semibold">{request.packageType}</p>
                          <p className="mt-1 text-slate-600">
                            {request.weight} kg
                          </p>
                        </td>

                        <td className="border-b border-slate-100 px-6 py-4">
                          <p className="font-semibold">{request.pickupDate}</p>
                          <p className="mt-1 text-slate-600">
                            {request.pickupTime}
                          </p>
                        </td>

                        <td className="border-b border-slate-100 px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              request.status,
                            )}`}
                          >
                            {formatStatusLabel(request.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold">Request Details</h2>
              <p className="mt-1 text-sm text-slate-600">
                Full information for the selected request.
              </p>
            </div>

            {activeRequest ? (
              <div className="p-6">
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase text-blue-700">
                    Selected Request
                  </p>
                  <p className="mt-1 break-all font-semibold">
                    {activeRequest.id}
                  </p>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-sm text-slate-600">Pickup Location</p>
                    <p className="font-semibold">
                      {activeRequest.pickupLocation}
                    </p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-sm text-slate-600">Destination</p>
                    <p className="font-semibold">{activeRequest.destination}</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-sm text-slate-600">Package</p>
                    <p className="font-semibold">
                      {activeRequest.packageType} • {activeRequest.weight} kg
                    </p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-sm text-slate-600">Pickup Schedule</p>
                    <p className="font-semibold">
                      {activeRequest.pickupDate} at {activeRequest.pickupTime}
                    </p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-sm text-slate-600">
                      Special Instructions
                    </p>
                    <p className="font-semibold">
                      {activeRequest.instructions ||
                        "No instructions provided."}
                    </p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-sm text-slate-600">Current Status</p>
                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        activeRequest.status,
                      )}`}
                    >
                      {formatStatusLabel(activeRequest.status)}
                    </span>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Update Status
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {statusActions.map((action) => (
                        <button
                          key={action.value}
                          type="button"
                          disabled={
                            isUpdatingStatus ||
                            activeRequest.status === action.value
                          }
                          onClick={() =>
                            handleStatusUpdate(activeRequest.id, action.value)
                          }
                          className="rounded-md border border-blue-700 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Created Date</p>
                    <p className="font-semibold">
                      {formatCreatedDate(activeRequest.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="p-6 text-sm text-slate-600">
                Select a request from the table to view details.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default RequestsListPage;
