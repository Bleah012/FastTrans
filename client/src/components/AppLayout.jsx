import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getAuthUser, logoutUser } from "../config/auth";

function AppLayout() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);

  // Loads the saved login session when the layout renders.
  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);

  const linkClass = ({ isActive }) =>
    `rounded-md px-4 py-2 text-sm font-semibold ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    }`;

  // Clears the saved JWT session and returns the user to login.
  const handleLogout = () => {
    logoutUser();
    setAuthUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-700">FastTrans</h1>
              <p className="text-sm text-slate-600">
                Transport Booking and Scheduling System
              </p>
            </div>

            {authUser ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">
                  {authUser.name} ({authUser.role})
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-fit rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Login
              </Link>
            )}
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/requests/new" className={linkClass}>
              New Request
            </NavLink>
            <NavLink to="/requests" className={linkClass}>
              Request Records
            </NavLink>
            <NavLink to="/offers" className={linkClass}>
              Offers
            </NavLink>
            <NavLink to="/offers/review" className={linkClass}>
              Offer Review
            </NavLink>
            <NavLink to="/availability" className={linkClass}>
              Availability
            </NavLink>
            <NavLink to="/scheduling" className={linkClass}>
              Scheduling
            </NavLink>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

export default AppLayout;
