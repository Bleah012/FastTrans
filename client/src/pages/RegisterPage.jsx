import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import { saveAuthUser } from "../config/auth";
import heroImage from "../assets/hero.png";

const defaultFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultFormData);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const showStatus = (message, type = "error") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      showStatus("Please complete all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      showStatus("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showStatus("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "client",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Registration failed.");
      }

      saveAuthUser(result.data);
      showStatus("Account created successfully.", "success");
      navigate("/dashboard");
    } catch (error) {
      showStatus(error.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="relative flex min-h-[520px] items-center overflow-hidden bg-cover bg-center px-6 py-12 sm:px-10 lg:min-h-screen"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-slate-950/75" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.45),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.24),transparent_28%)]" />

          <div className="relative z-10 max-w-3xl animate-[fadeIn_700ms_ease-out]">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Truck size={18} />
              FastTrans
            </Link>

            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles size={17} />
              Create your transport account
            </p>

            <h1 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
              Book transport, track requests, and review your offers.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Sign up as a FastTrans client to submit transport requests and
              only access offers connected to your own account.
            </p>

            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                ["Secure", "Protected login"],
                ["Private", "Your own records"],
                ["Fast", "Simple booking"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <BadgeCheck className="text-blue-300" size={24} />
                  <p className="mt-3 font-bold">{title}</p>
                  <p className="mt-1 text-sm text-slate-200">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-slate-100 px-6 py-12 text-slate-950">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-xl animate-[slideUp_650ms_ease-out]"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  FastTrans Client Access
                </p>
                <h2 className="mt-3 text-4xl font-black">Create Account</h2>
                <p className="mt-3 text-slate-600">
                  Register to submit requests and review your transport offers.
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-blue-700">
                <ShieldCheck size={32} />
              </div>
            </div>

            {statusMessage && (
              <div
                className={`mb-5 rounded-md px-4 py-3 text-sm font-semibold ${
                  statusType === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {statusMessage}
              </div>
            )}

            <div className="grid gap-5">
              <label className="text-sm font-semibold text-slate-700">
                Full Name
                <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 px-4 py-3 focus-within:border-blue-600">
                  <User size={19} className="text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none"
                    placeholder="Your full name"
                  />
                </div>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Email
                <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 px-4 py-3 focus-within:border-blue-600">
                  <Mail size={19} className="text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Password
                <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 px-4 py-3 focus-within:border-blue-600">
                  <Lock size={19} className="text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none"
                    placeholder="Create a password"
                  />
                </div>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Confirm Password
                <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 px-4 py-3 focus-within:border-blue-600">
                  <Lock size={19} className="text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none"
                    placeholder="Confirm password"
                  />
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-4 text-base font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
              <ArrowRight size={20} />
            </button>

            <div className="mt-6 flex flex-col gap-3 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
              <Link to="/" className="text-blue-700 hover:text-blue-800">
                Back to landing
              </Link>
              <Link to="/login" className="text-slate-600 hover:text-blue-700">
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
