import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold mb-4">
              Activating your account...
            </h1>
            <p>Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-bold text-green-600 mb-4">
              Account Activated 🎉
            </h1>
            <p className="mb-4">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-4">
              Activation Failed
            </h1>
            <p className="mb-4">{message}</p>
            <Link
              to="/register"
              className="text-blue-600 hover:underline"
            >
              Register again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
