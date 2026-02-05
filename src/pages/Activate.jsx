import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Cloud, Loader2, XCircle } from "lucide-react";
import { activate as activateApi } from "../api/auth.api";

export default function Activate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const activateAccount = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid activation link");
        return;
      }

      try {
        const res = await activateApi(token);
        setStatus("success");
        setMessage(res.data.message || "Account activated");
        localStorage.removeItem("activationPending");
        localStorage.removeItem("activationEmail");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Activation failed"
        );
      }
    };

    activateAccount();
  }, [token]);

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

          <div className="w-full rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur text-center">
            {status === "loading" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
                <h1 className="text-2xl font-semibold mb-2">
                  Activating your account...
                </h1>
                <p className="text-sm text-slate-600">Please wait</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600/10">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-semibold mb-3">
                  Account Activated!
                </h1>
                <p className="text-sm text-slate-600 mb-8">{message}</p>
                <button
                  onClick={() => navigate("/login")}
                  className="h-12 w-full rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
                >
                  Go to Login
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/10">
                  <XCircle className="h-8 w-8 text-rose-600" />
                </div>
                <h1 className="text-2xl font-semibold mb-3 text-rose-600">
                  Activation Failed
                </h1>
                <p className="text-sm text-slate-600 mb-6">{message}</p>
                <Link
                  to="/register"
                  className="text-sm text-blue-600 underline-offset-4 hover:underline"
                >
                  Register again
                </Link>
              </>
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
