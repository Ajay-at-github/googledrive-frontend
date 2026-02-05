import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Cloud, Eye, EyeOff, Lock } from "lucide-react";
import { resetPassword as resetPasswordApi } from "../api/auth.api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordApi({
        token,
        newPassword,
      });
      setSuccess(true);

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset failed"
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
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Reset Password
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Create a new password for your account
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-emerald-700">
                <p className="font-semibold mb-2">
                  Password reset successful 🎉
                </p>
                <p className="text-sm">
                  Redirecting to login…
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            {!success && (
              <Link
                to="/login"
                className="block text-center mt-6 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Back to Login
              </Link>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            © 2026 CloudDrive. Secure cloud storage for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
