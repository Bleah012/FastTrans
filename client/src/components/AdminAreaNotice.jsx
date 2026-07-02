import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuthUser } from "../config/auth";

function AdminAreaNotice({
  title = "Protected Admin Area",
  description = "Login as an admin or manager before performing protected operations.",
}) {
  const authUser = getAuthUser();
  const hasAdminAccess =
    authUser?.role === "admin" || authUser?.role === "manager";

  return (
    <section
      className={`mb-6 rounded-lg border p-4 shadow-sm ${
        hasAdminAccess
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-md ${
              hasAdminAccess
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {hasAdminAccess
                ? `Signed in as ${authUser.name} (${authUser.role}).`
                : description}
            </p>
          </div>
        </div>

        {!hasAdminAccess && (
          <Link
            to="/login"
            className="w-fit rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Admin Login
          </Link>
        )}
      </div>
    </section>
  );
}

export default AdminAreaNotice;
