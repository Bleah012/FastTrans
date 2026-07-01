import { useEffect, useState } from "react";

function RequestsListPage({ onNewRequest }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  // Fetches all transport requests from the Express server.
  const fetchRequests = async () => {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/requests");
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

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-300 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">FastTrans</h1>
            <p className="text-slate-600">Client Request Records</p>
          </div>

          <div className="flex gap-3">
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
        </header>

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
                Click a request row to view its full details.
              </p>
            </div>

            <div className="grid gap-4 border-b border-slate-200 px-6 py-5 md:grid-cols-[2fr_1fr_auto] md:items-end">
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
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="assigned">Assigned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="rounded-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                {filteredRequests.length} of {requests.length} shown
              </div>
            </div>

            {isLoading ? (
              <p className="px-6 py-8 text-slate-600">Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="px-6 py-8 text-slate-600">
                No requests match your search or filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="border-b border-slate-200 px-6 py-3">
                        Pickup
                      </th>
                      <th className="border-b border-slate-200 px-6 py-3">
                        Destination
                      </th>
                      <th className="border-b border-slate-200 px-6 py-3">
                        Package
                      </th>
                      <th className="border-b border-slate-200 px-6 py-3">
                        Weight
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
                          {request.pickupLocation}
                        </td>
                        <td className="border-b border-slate-100 px-6 py-4">
                          {request.destination}
                        </td>
                        <td className="border-b border-slate-100 px-6 py-4">
                          {request.packageType}
                        </td>
                        <td className="border-b border-slate-100 px-6 py-4">
                          {request.weight} kg
                        </td>
                        <td className="border-b border-slate-100 px-6 py-4">
                          {request.pickupDate} at {request.pickupTime}
                        </td>
                        <td className="border-b border-slate-100 px-6 py-4">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Request Details</h2>
            <p className="mt-1 text-sm text-slate-600">
              Full information for the selected request.
            </p>

            {activeRequest ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase text-blue-700">
                    Request ID
                  </p>
                  <p className="mt-1 break-all font-semibold">
                    {activeRequest.id}
                  </p>
                </div>

                <div className="grid gap-4">
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
                    <p className="text-sm text-slate-600">Package Type</p>
                    <p className="font-semibold">{activeRequest.packageType}</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-sm text-slate-600">Weight</p>
                    <p className="font-semibold">{activeRequest.weight} kg</p>
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
                    <p className="text-sm text-slate-600">Status</p>
                    <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {activeRequest.status}
                    </span>
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
              <p className="mt-6 text-sm text-slate-600">
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
