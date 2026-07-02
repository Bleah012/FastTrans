import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { getAuthToken, getAuthUser } from "../config/auth";

function RequestsListPage() {
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [authUser, setAuthUser] = useState(null);

  const canUpdateStatus =
    authUser?.role === "admin" || authUser?.role === "manager";
  const canDeleteRequest = authUser?.role === "admin";

  // Loads the logged-in user from browser storage.
  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);

  // Fetches all transport requests from the backend.
  const loadRequests = async () => {
    setIsLoading(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.requests);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load requests.");
      }

      setRequests(result.data || []);
      setStatusMessage("Requests loaded successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to load requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getRequestId = (request) => request.id || request._id;

  const selectedRequest = useMemo(() => {
    return requests.find(
      (request) => getRequestId(request) === selectedRequestId,
    );
  }, [requests, selectedRequestId]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchText = [
        request.pickupLocation,
        request.destination,
        request.packageType,
        request.instructions,
        request.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // Sends the JWT token when changing protected request status.
  const handleStatusUpdate = async (requestId, status) => {
    const token = getAuthToken();

    if (!token) {
      setErrorMessage("Please login as an admin or manager first.");
      return;
    }

    setUpdatingId(requestId);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_ENDPOINTS.requests}/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update request status.");
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          getRequestId(request) === requestId ? result.data : request,
        ),
      );
      setStatusMessage("Request status updated successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to update request status.");
    } finally {
      setUpdatingId("");
    }
  };

  // Sends the JWT token when deleting a protected request.
  const handleDeleteRequest = async (requestId) => {
    const token = getAuthToken();

    if (!token) {
      setErrorMessage("Please login as an admin first.");
      return;
    }

    setUpdatingId(requestId);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_ENDPOINTS.requests}/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete request.");
      }

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => getRequestId(request) !== requestId,
        ),
      );

      if (selectedRequestId === requestId) {
        setSelectedRequestId("");
      }

      setStatusMessage("Request deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete request.");
    } finally {
      setUpdatingId("");
    }
  };

  const statusCounts = useMemo(() => {
    return requests.reduce(
      (counts, request) => ({
        ...counts,
        [request.status]: (counts[request.status] || 0) + 1,
      }),
      { pending: 0, approved: 0, rejected: 0 },
    );
  }, [requests]);

  return (
    <main className="min-h-[calc(100vh-96px)] bg-slate-50 px-6 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Request Records
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Submitted Transport Requests
            </h1>
            <p className="mt-2 text-slate-600">
              Review client transport requests and manage protected admin
              actions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadRequests}
              className="rounded-md border border-blue-700 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Refresh
            </button>
            <Link
              to="/request"
              className="rounded-md bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              New Request
            </Link>
            {!authUser && (
              <Link
                to="/login"
                className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {requests.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {statusCounts.pending}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {statusCounts.approved}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {statusCounts.rejected}
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-6 rounded-md bg-emerald-50 px-4 py-3 font-semibold text-emerald-700">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-md bg-red-50 px-4 py-3 font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <input
            className="rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            type="search"
            placeholder="Search by pickup, destination, package, or status"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            className="rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-950">
              Transport Request List
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {authUser
                ? `Signed in as ${authUser.name} (${authUser.role})`
                : "Login is required for protected admin actions."}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="bg-slate-100 text-sm text-slate-700">
                <tr>
                  <th className="px-6 py-4">Pickup</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="px-6 py-8 text-slate-500" colSpan="7">
                      Loading requests...
                    </td>
                  </tr>
                )}

                {!isLoading && filteredRequests.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-slate-500" colSpan="7">
                      No matching requests found.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  filteredRequests.map((request) => {
                    const requestId = getRequestId(request);
                    const isUpdating = updatingId === requestId;

                    return (
                      <tr
                        key={requestId}
                        className="border-t border-slate-100 text-sm"
                      >
                        <td className="px-6 py-4 font-medium text-slate-950">
                          {request.pickupLocation}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {request.destination}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {request.packageType}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {request.weight} kg
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {request.pickupDate} at {request.pickupTime}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRequestId(requestId)}
                              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              disabled={!canUpdateStatus || isUpdating}
                              onClick={() =>
                                handleStatusUpdate(requestId, "approved")
                              }
                              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={!canUpdateStatus || isUpdating}
                              onClick={() =>
                                handleStatusUpdate(requestId, "rejected")
                              }
                              className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              disabled={!canDeleteRequest || isUpdating}
                              onClick={() => handleDeleteRequest(requestId)}
                              className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {selectedRequest && (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Request Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ID: {getRequestId(selectedRequest)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestId("")}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Pickup"
                value={selectedRequest.pickupLocation}
              />
              <DetailItem
                label="Destination"
                value={selectedRequest.destination}
              />
              <DetailItem label="Package" value={selectedRequest.packageType} />
              <DetailItem
                label="Weight"
                value={`${selectedRequest.weight} kg`}
              />
              <DetailItem
                label="Pickup Date"
                value={selectedRequest.pickupDate}
              />
              <DetailItem
                label="Pickup Time"
                value={selectedRequest.pickupTime}
              />
            </div>

            <div className="mt-5 rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Special Instructions
              </p>
              <p className="mt-2 text-slate-600">
                {selectedRequest.instructions || "No instructions provided."}
              </p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default RequestsListPage;
