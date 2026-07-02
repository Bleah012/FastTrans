import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Page Not Found
          </p>

          <h2 className="mt-2 text-3xl font-bold">This page does not exist</h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            The FastTrans client frontend could not find the page you opened.
            Use the navigation above or return to the dashboard.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Go to Dashboard
            </Link>

            <Link
              to="/requests/new"
              className="rounded-md border border-blue-700 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              New Request
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
