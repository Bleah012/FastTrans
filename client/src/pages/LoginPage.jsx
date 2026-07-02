import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { getAuthUser, saveAuthUser } from "../config/auth";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "admin@fasttrans.com",
    password: "password123",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirects an already logged-in user away from the login page.
  useEffect(() => {
    const user = getAuthUser();

    if (user?.token) {
      navigate("/requests");
    }
  }, [navigate]);

  // Keeps the input fields controlled by React state.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  // Sends login details to the backend and stores the JWT user data.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed.");
      }

      saveAuthUser(result.data);
      setStatusMessage("Login successful. Redirecting...");
      navigate("/requests");
    } catch (error) {
      setErrorMessage(error.message || "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-96px)] bg-slate-50 px-6 py-10">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            FastTrans Access
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            Sign in to manage transport operations
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Admin and manager accounts can update request approvals, manage
            protected actions, and continue backend workflows securely.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-950">Login</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use the admin account created in the backend test.
          </p>

          {statusMessage && (
            <div className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <label className="mt-6 block text-sm font-semibold text-slate-800">
            Email
          </label>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="mt-5 block text-sm font-semibold text-slate-800">
            Password
          </label>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 w-full rounded-md bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
