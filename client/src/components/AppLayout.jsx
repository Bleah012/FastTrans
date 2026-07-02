import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {
  const linkClass = ({ isActive }) =>
    `rounded-md px-4 py-2 text-sm font-semibold ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">FastTrans</h1>
            <p className="text-sm text-slate-600">Client Request Frontend</p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavLink to="/requests/new" className={linkClass}>
              New Request
            </NavLink>
            <NavLink to="/requests" className={linkClass}>
              Request Records
            </NavLink>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

export default AppLayout;
