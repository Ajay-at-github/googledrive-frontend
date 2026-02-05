import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Cloud, Mail } from "lucide-react";
import { forgotPassword as forgotPasswordApi } from "../api/auth.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await forgotPasswordApi(email);
      setSuccess(true);
      setMessage(
        res.data.message || "Password reset email sent"
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900">
      <div className="relative isolate flex min-h-screen items-center justify-center px-6 py-12">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute -right-16 bottom-6 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Cloud className="h-6 w-6" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              CloudDrive
            </span>
          </div>

          <div className="w-full rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Forgot password?
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Enter your registered email address and we'll send you a password reset link.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-emerald-700">
                <p className="font-semibold mb-2">{message}</p>
                <p className="text-sm">
                  Please check your email to reset your password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            © 2026 CloudDrive. Secure cloud storage for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
