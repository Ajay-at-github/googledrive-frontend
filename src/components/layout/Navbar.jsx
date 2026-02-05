import React from "react";
import useAuth from "../../hooks/useAuth";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">My Drive</h1>

      <button
        onClick={logout}
        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
