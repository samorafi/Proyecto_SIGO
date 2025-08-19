// src/layouts/auth.jsx
import { Outlet } from "react-router-dom";

export default function Auth() {
  return (
    <div className="min-h-screen grid place-items-center bg-blue-gray-50">
      <Outlet />
    </div>
  );
}
