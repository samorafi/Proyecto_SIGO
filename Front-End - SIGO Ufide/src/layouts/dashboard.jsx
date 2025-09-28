// src/layouts/dashboard.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import routes from "@/routes";
import { Sidenav, Yellowbar, Footer } from "@/index";

export default function Dashboard() {
  const [openSide, setOpenSide] = useState(false);

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <div className="flex">
        {/* Desktop fijo + Overlay mobile controlado por openSide */}
        <Sidenav routes={routes} isOpen={openSide} onClose={() => setOpenSide(false)} />

        <div className="flex-1 p-4">
          <Yellowbar onMenuClick={() => setOpenSide(true)} />
          <div className="mt-4">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
