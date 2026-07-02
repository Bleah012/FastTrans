import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CalendarClock,
  ClipboardList,
  FilePlus2,
  Gauge,
  LogIn,
  LogOut,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getAuthUser, logoutUser } from "../config/auth";

const clientLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/requests/new", label: "New Request", icon: FilePlus2 },
  { to: "/requests", label: "Request Records", icon: ClipboardList },
  { to: "/offers/review", label: "Offer Review", icon: PackageCheck },
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/requests", label: "Request Records", icon: ClipboardList },
  { to: "/offers", label: "Offers", icon: PackageCheck },
  { to: "/availability", label: "Availability", icon: Truck },
  { to: "/scheduling", label: "Scheduling", icon: CalendarClock },
];

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authUser, setAuthUser] = useState(getAuthUser());

  useEffect(() => {
    setAuthUser(getAuthUser());
  }, [location.pathname]);

  const isAdminUser =
    authUser?.role === "admin" || authUser?.role === "manager";

  const navigationLinks = isAdminUser ? adminLinks : clientLinks;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-blue-700 text-white shadow-sm"
        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    }`;

  const handleLogout = () => {
    logoutUser();
    setAuthUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:flex">
      <aside className="border-b border-slate-200 bg-white shadow-sm lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col px-5 py-5">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-blue-50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
              <Truck size={24} />
            </span>
            <span>
              <span className="block text-2xl font-bold text-blue-700">
                FastTrans
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Transport Booking System
              </span>
            </span>
          </Link>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldCheck size={18} className="text-blue-700" />
              {authUser ? authUser.role : "Client Access"}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {authUser ? authUser.email : "Public request workspace"}
            </p>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {navigationLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-slate-200 pt-5 lg:mt-auto">
            {authUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>
        </div>
      </aside>

      <div className="min-h-screen flex-1 lg:pl-72">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
