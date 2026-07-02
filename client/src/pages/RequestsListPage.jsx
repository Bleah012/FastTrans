import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import { getAuthToken, getAuthUser } from "../config/auth";

function RequestsListPage({ onNewRequest }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState("");

  const authUser = getAuthUser();
  const isAdmin = authUser?.role === "admin" || authUser?.role === "manager";
  const canDelete = authUser?.role === "admin";

  const showStatus = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const buildRequestsUrl = () => {
    if (authUser && !isAdmin) {
      return `${API_ENDPOINTS.requests}?clientEmail=${encodeURIComponent(
        authUser.email,
      )}`;
    }

    return API_ENDPOINTS.requests;
  };

  const loadRequests = async () => {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch(buildRequestsUrl());
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load requests.");
      }

      setRequests(result.data || []);
      setSelectedRequest(result.data?.[0] || null);
      showStatus(
        isAdmin
          ? "All request records loaded successfully."
          : "Your request records loaded successfully.",
      );
    } catch (error) {
      showStatus(error.message || "Failed to load requests.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return requests.filter((request) => {
      const matchesSearch =
        !normalizedSearch ||
        request.pickupLocation?.toLowerCase().includes(normalizedSearch) ||
        request.destination?.toLowerCase().includes(normalizedSearch) ||
        request.packageType?.toLowerCase().includes(normalizedSearch) ||
        request.status?.toLowerCase().includes(normalizedSearch) ||
        request.clientName?.toLowerCase().includes(normalizedSearch) ||
        request.clientEmail?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const totals = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === "pending")
        .length,
      approved: requests.filter((request) => request.status === "approved")
        .length,
      rejected: requests.filter((request) => request.status === "rejected")
        .length,
    }),
    [requests],
  );

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  const handleUpdateStatus = async (requestId, status) => {
    if (!isAdmin) {
      showStatus(
        "Only an admin or manager can update request status.",
        "error",
      );
      return;
    }

    const authToken = getAuthToken();
    setActionId(`${requestId}-${status}`);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.requests}/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update request status.");
      }

      const updatedRequests = requests.map((request) =>
        request.id === requestId ? result.data : request,
      );

      setRequests(updatedRequests);
      setSelectedRequest(result.data);
      showStatus("Request status updated successfully.");
    } catch (error) {
      showStatus(error.message || "Failed to update request status.", "error");
    } finally {
      setActionId("");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!canDelete) {
      showStatus("Only an admin can delete a request.", "error");
      return;
    }

    const authToken = getAuthToken();
    setActionId(`${requestId}-delete`);

    try {
      const response = await fetch(`${API_ENDPOINTS.requests}/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete request.");
      }

      const updatedRequests = requests.filter(
        (request) => request.id !== requestId,
      );

      setRequests(updatedRequests);
      setSelectedRequest(updatedRequests[0] || null);
      showStatus("Request deleted successfully.");
    } catch (error) {
      showStatus(error.message || "Failed to delete request.", "error");
    } finally {
      setActionId("");
    }
  };

  const formatSchedule = (request) =>
    `${request.pickupDate || "No date"} at ${request.pickupTime || "No time"}`;

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              {isAdmin ? "Request Records" : "My Request Records"}
            </p>
            <h1 className="mt-2 text-3xl font-black">
              {isAdmin
                ? "Submitted Transport Requests"
                : "My Submitted Transport Requests"}
            </h1>
            <p className="mt-2 text-slate-600">
              {isAdmin
                ? "Review all client transport requests and manage protected admin actions."
                : "Review only the transport requests submitted using your account."}
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
              onClick={loadRequests}
              className="inline-flex items-center gap-2 rounded-md border border-blue-700 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <RefreshCw size={18} />
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>

            {!isAdmin && (
              <button
                type="button"
                onClick={onNewRequest}
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <ClipboardList size={18} />
                New Request
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Total</p>
            <p className="mt-3 text-3xl font-bold">{totals.total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Pending</p>
            <p className="mt-3 text-3xl font-bold text-amber-700">
              {totals.pending}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Approved</p>
            <p className="mt-3 text-3xl font-bold text-emerald-700">
              {totals.approved}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Rejected</p>
            <p className="mt-3 text-3xl font-bold text-red-700">
              {totals.rejected}
            </p>
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

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder={
                isAdmin
                  ? "Search by client, pickup, destination, package, or status"
                  : "Search your requests by pickup, destination, package, or status"
              }
            />
          </label>

          <label className="flex items-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-transparent outline-none"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.45fr]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold">
                {isAdmin
                  ? "Transport Request List"
                  : "My Transport Request List"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {isAdmin
                  ? "Admin and manager accounts can approve or reject requests."
                  : "Only requests connected to your account are shown here."}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    {isAdmin && <th className="px-5 py-4">Client</th>}
                    <th className="px-5 py-4">Pickup</th>
                    <th className="px-5 py-4">Destination</th>
                    <th className="px-5 py-4">Package</th>
                    <th className="px-5 py-4">Weight</th>
                    <th className="px-5 py-4">Schedule</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-t border-slate-100">
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {request.clientName || "Unknown client"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.clientEmail || "No email"}
                          </p>
                        </td>
                      )}
                      <td className="px-5 py-4 font-semibold">
                        {request.pickupLocation}
                      </td>
                      <td className="px-5 py-4">{request.destination}</td>
                      <td className="px-5 py-4">{request.packageType}</td>
                      <td className="px-5 py-4">{request.weight} kg</td>
                      <td className="px-5 py-4">{formatSchedule(request)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusClass(
                            request.status,
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(request)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye size={14} />
                            Details
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateStatus(request.id, "approved")
                                }
                                disabled={
                                  request.status === "approved" ||
                                  actionId === `${request.id}-approved`
                                }
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateStatus(request.id, "rejected")
                                }
                                disabled={
                                  request.status === "rejected" ||
                                  actionId === `${request.id}-rejected`
                                }
                                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(request.id)}
                              disabled={actionId === `${request.id}-delete`}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan={isAdmin ? "8" : "7"}
                        className="px-5 py-8 text-center text-slate-600"
                      >
                        No matching transport requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-700" />
              <h2 className="text-xl font-bold">Request Details</h2>
            </div>

            {!selectedRequest ? (
              <p className="text-sm text-slate-600">
                Select a request to inspect the full details.
              </p>
            ) : (
              <div className="space-y-4 text-sm">
                {isAdmin && (
                  <div>
                    <p className="text-slate-500">Client</p>
                    <p className="font-semibold">
                      {selectedRequest.clientName || "Unknown client"}
                    </p>
                    <p className="text-slate-600">
                      {selectedRequest.clientEmail || "No email"}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-slate-500">Route</p>
                  <p className="font-semibold">
                    {selectedRequest.pickupLocation} to{" "}
                    {selectedRequest.destination}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Package</p>
                  <p className="font-semibold">
                    {selectedRequest.packageType} - {selectedRequest.weight} kg
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Pickup</p>
                  <p className="font-semibold">
                    {formatSchedule(selectedRequest)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Status</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusClass(
                      selectedRequest.status,
                    )}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <div>
                  <p className="text-slate-500">Instructions</p>
                  <p className="font-semibold">
                    {selectedRequest.instructions || "No special instructions."}
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default RequestsListPage;
