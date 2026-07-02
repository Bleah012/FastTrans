import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  PackageCheck,
  Timer,
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import { getAuthUser } from "../config/auth";

function ClientDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const authUser = getAuthUser();
  const isAdmin = authUser?.role === "admin" || authUser?.role === "manager";

  const loadRequests = async () => {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const requestUrl =
        authUser && !isAdmin
          ? `${API_ENDPOINTS.requests}?clientEmail=${encodeURIComponent(
              authUser.email,
            )}`
          : API_ENDPOINTS.requests;

      const response = await fetch(requestUrl);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load dashboard data.");
      }

      setRequests(result.data || []);
    } catch (error) {
      setStatusMessage(error.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const latestRequest = requests[0];

  const stats = [
    {
      label: isAdmin ? "Total Requests" : "My Requests",
      value: requests.length,
      icon: ClipboardList,
      color: "text-slate-950",
    },
    {
      label: "Pending Requests",
      value: requests.filter((request) => request.status === "pending").length,
      icon: Timer,
      color: "text-amber-700",
    },
    {
      label: "Approved Requests",
      value: requests.filter((request) => request.status === "approved").length,
      icon: CheckCircle2,
      color: "text-emerald-700",
    },
  ];

  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            {isAdmin ? "Admin Overview" : "Client Frontend Overview"}
          </p>
          <h1 className="mt-2 text-3xl font-black">
            {isAdmin
              ? "FastTrans Admin Dashboard"
              : "FastTrans Client Dashboard"}
          </h1>
          <p className="mt-2 text-slate-600">
            {isAdmin
              ? "Review all transport activity across the platform."
              : "Start a new transport request or review your submitted client records."}
          </p>
          {authUser && (
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Signed in as {authUser.name} ({authUser.email})
            </p>
          )}
        </div>

        {statusMessage && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {statusMessage}
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-600">
                    {stat.label}
                  </p>
                  <Icon size={22} className="text-blue-700" />
                </div>
                <p className={`mt-4 text-4xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {!isAdmin && (
            <Link
              to="/requests/new"
              className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <FilePlus2 className="text-blue-700" size={28} />
                  <h2 className="mt-4 text-2xl font-bold">
                    Create Client Request
                  </h2>
                  <p className="mt-3 max-w-xl text-slate-600">
                    Open the request form to capture pickup, destination,
                    package, and schedule details.
                  </p>
                </div>
                <ArrowRight
                  className="mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700"
                  size={24}
                />
              </div>
            </Link>
          )}

          <Link
            to="/requests"
            className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <ClipboardList className="text-blue-700" size={28} />
                <h2 className="mt-4 text-2xl font-bold">
                  {isAdmin ? "Review Request Records" : "Review My Requests"}
                </h2>
                <p className="mt-3 max-w-xl text-slate-600">
                  {isAdmin
                    ? "View submitted requests, search records, inspect details, and update request status."
                    : "View your submitted requests, search records, and inspect status updates."}
                </p>
              </div>
              <ArrowRight
                className="mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700"
                size={24}
              />
            </div>
          </Link>

          {!isAdmin && (
            <Link
              to="/offers/review"
              className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <PackageCheck className="text-blue-700" size={28} />
                  <h2 className="mt-4 text-2xl font-bold">Review My Offers</h2>
                  <p className="mt-3 max-w-xl text-slate-600">
                    Check offers generated for your transport requests and
                    accept or reject them.
                  </p>
                </div>
                <ArrowRight
                  className="mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700"
                  size={24}
                />
              </div>
            </Link>
          )}
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                {isAdmin ? "Latest Platform Request" : "My Latest Request"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {isLoading
                  ? "Loading request activity..."
                  : "Most recent request activity from MongoDB."}
              </p>
            </div>
          </div>

          {!latestRequest ? (
            <p className="text-slate-600">
              {isAdmin
                ? "No transport requests have been submitted yet."
                : "You have not submitted any transport requests yet."}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-slate-500">Route</p>
                <p className="mt-1 font-bold">
                  {latestRequest.pickupLocation} to {latestRequest.destination}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Package</p>
                <p className="mt-1 font-bold">
                  {latestRequest.packageType} - {latestRequest.weight} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pickup</p>
                <p className="mt-1 font-bold">
                  {latestRequest.pickupDate} at {latestRequest.pickupTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <span className="mt-1 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                  {latestRequest.status}
                </span>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default ClientDashboardPage;
