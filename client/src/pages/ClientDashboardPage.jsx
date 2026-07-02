import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

function ClientDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  // Loads submitted requests so the dashboard can show live totals.
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.requests);
        const result = await response.json();

        if (!response.ok) {
          setStatusMessage(result.message || "Failed to load dashboard data.");
          return;
        }

        setRequests(result.data || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setStatusMessage("Could not connect to the FastTrans server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const pendingCount = requests.filter(
    (request) => request.status === "pending",
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "completed",
  ).length;

  const latestRequest = requests[requests.length - 1];

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Client Frontend Overview
          </p>
          <h2 className="mt-1 text-3xl font-bold">
            FastTrans Client Dashboard
          </h2>
          <p className="mt-1 text-slate-600">
            Start a new transport request or review submitted client records.
          </p>
        </div>

        {statusMessage && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {statusMessage}
          </div>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Total Requests
            </p>
            <p className="mt-2 text-3xl font-bold">
              {isLoading ? "..." : requests.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Pending Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {isLoading ? "..." : pendingCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Completed Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : completedCount}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Create Client Request</h3>
            <p className="mt-2 text-slate-600">
              Open the request form to capture pickup, destination, package, and
              schedule details.
            </p>

            <Link
              to="/requests/new"
              className="mt-6 inline-block rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              New Request
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Review Request Records</h3>
            <p className="mt-2 text-slate-600">
              View submitted requests, search records, inspect details, and
              update request status.
            </p>

            <Link
              to="/requests"
              className="mt-6 inline-block rounded-md border border-blue-700 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              View Records
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Latest Request</h3>

          {isLoading ? (
            <p className="mt-3 text-slate-600">Loading latest request...</p>
          ) : latestRequest ? (
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-slate-600">Route</p>
                <p className="mt-1 font-semibold">
                  {latestRequest.pickupLocation} to {latestRequest.destination}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Package</p>
                <p className="mt-1 font-semibold">
                  {latestRequest.packageType} - {latestRequest.weight} kg
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Pickup</p>
                <p className="mt-1 font-semibold">
                  {latestRequest.pickupDate} at {latestRequest.pickupTime}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Status</p>
                <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {latestRequest.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-slate-600">
              No client requests have been submitted yet.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

export default ClientDashboardPage;
