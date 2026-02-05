// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { login as loginApi } from "../api/auth.api";
// import useAuth from "../hooks/useAuth";

// export default function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await loginApi(form);

//       // Store JWT in context + localStorage
//       login(res.data.token);

//       // Redirect to dashboard
//       navigate("/");
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Login failed"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">
//           Login
//         </h1>

//         {error && (
//           <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               required
//               className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={form.password}
//               onChange={handleChange}
//               required
//               className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="text-sm text-center mt-4 space-y-1">
//           <Link
//             to="/forgot-password"
//             className="text-blue-600 hover:underline block"
//           >
//             Forgot password?
//           </Link>

//           <span>
//             Don’t have an account?{" "}
//             <Link
//               to="/register"
//               className="text-blue-600 hover:underline"
//             >
//               Register
//             </Link>
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cloud, Eye, EyeOff } from "lucide-react";
import { login as loginApi } from "../api/auth.api";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(form);

      // Store JWT in context + localStorage
      login(res.data.token);

      // Redirect to Home
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
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
              <h1 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Sign in to access your files
              </p>
            </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-slate-900 underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

            <p className="text-center mt-6 text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            © 2026 CloudDrive. Secure cloud storage for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}