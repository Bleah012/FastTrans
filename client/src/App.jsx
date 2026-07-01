function App() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">FastTrans</h1>
            <p className="text-sm text-slate-500">
              Transport Booking and Vehicle Scheduling System
            </p>
          </div>

          <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            Client Module First
          </span>
        </nav>

        <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-blue-700">
              FastTrans Setup
            </p>

            <h2 className="mb-5 text-4xl font-bold leading-tight text-slate-950">
              Manage transport requests, vehicle matching, offers, and
              scheduling.
            </h2>

            <p className="mb-8 max-w-xl text-base leading-7 text-slate-600">
              This project is being built with a React and Vite client, an
              Express server, MongoDB, Mongoose, and GitHub version control.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
                Start Client Request
              </button>

              <button className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-white">
                View Dashboard
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-slate-950">
              First Priority: Client Request Form
            </h3>

            <div className="space-y-4">
              <div className="rounded-md border border-slate-200 p-4">
                <p className="font-medium text-slate-900">Step 1: Route</p>
                <p className="text-sm text-slate-500">
                  Pickup location, destination, and route preview.
                </p>
              </div>

              <div className="rounded-md border border-slate-200 p-4">
                <p className="font-medium text-slate-900">Step 2: Package</p>
                <p className="text-sm text-slate-500">
                  Package type, size, weight, and handling options.
                </p>
              </div>

              <div className="rounded-md border border-slate-200 p-4">
                <p className="font-medium text-slate-900">Step 3: Schedule</p>
                <p className="text-sm text-slate-500">
                  Preferred pickup date, pickup time, and request submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
