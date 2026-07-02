import {
  ArrowRight,
  ClipboardCheck,
  Clock,
  LockKeyhole,
  MapPinned,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

const heroImage =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1800&q=85";

const workflowItems = [
  {
    icon: ClipboardCheck,
    title: "Submit Request",
    text: "Clients enter pickup, destination, cargo, and schedule details.",
  },
  {
    icon: Route,
    title: "Match Route",
    text: "FastTrans estimates distance, duration, and suitable vehicles.",
  },
  {
    icon: ShieldCheck,
    title: "Approve Offer",
    text: "Admins manage offers, confirmations, and protected decisions.",
  },
  {
    icon: Truck,
    title: "Schedule Trip",
    text: "Accepted bookings move into vehicle scheduling and dispatch.",
  },
];

const stats = [
  { label: "Request Flow", value: "Live" },
  { label: "Admin Actions", value: "JWT" },
  { label: "Storage", value: "MongoDB" },
];

function LandingPage() {
  return (
    <main className="bg-slate-950 text-white">
      <section
        className="relative flex min-h-[78vh] items-center overflow-hidden bg-cover bg-center px-6 py-16"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl animate-[fadeUp_700ms_ease-out]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
              <Truck size={18} />
              Transport booking made faster
            </div>

            <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              FastTrans
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100">
              A transport booking and vehicle scheduling system for client
              requests, route matching, offer management, and protected admin
              operations.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/requests/new"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-1 hover:bg-blue-700"
              >
                New Request
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
              >
                Admin Login
                <LockKeyhole size={18} />
              </Link>
            </div>
          </div>

          <div className="animate-[fadeUp_900ms_ease-out] rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-md bg-white/10 p-4">
                  <p className="text-sm text-blue-100">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-md bg-white p-5 text-slate-950">
              <div className="flex items-center gap-3">
                <MapPinned className="text-blue-700" size={28} />
                <div>
                  <p className="font-bold">Nairobi to Mombasa</p>
                  <p className="text-sm text-slate-500">
                    Request, offer, vehicle match, schedule
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {["Request captured", "Offer prepared", "Vehicle assigned"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-md bg-slate-100 px-4 py-3"
                    >
                      <span className="font-semibold text-slate-700">
                        {item}
                      </span>
                      <Clock size={18} className="text-blue-700" />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-12 text-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Workflow
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                From request to scheduled transport
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-md border border-blue-700 px-5 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              View Dashboard
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
