// src/widgets/layout/dashboard-navbar.jsx
import { Navbar as MTNavbar, IconButton } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function DashboardNavbar({ onMenuClick = () => { } }) {
  return (
    <>
      {/* Móvil: solo botón para abrir el sidebar */}
      <MTNavbar
        fullWidth
        className="lg:hidden !bg-transparent shadow-none border-0 px-0 py-0 mb-4"
      >
        <IconButton variant="text" onClick={onMenuClick} aria-label="Abrir menú">
          <Bars3Icon className="h-6 w-6 text-[#2B338C]" />
        </IconButton>
      </MTNavbar>

      {/* Desktop: barra azul con franja amarilla (decorativa) */}
      <MTNavbar
        fullWidth
        className="hidden lg:block rounded-xl border-0 shadow-md !bg-[#2B338C] px-0 py-3 mb-4"
      >
        {/* padding interno mínimo */}
        <div className="px-3">
          {/* franja amarilla casi a todo lo ancho */}
          <div
            className="h-1.5 rounded-full w-full mx-2 lg:mx-3"
            style={{ background: "#FFDA00" }}
          />
        </div>
      </MTNavbar>

    </>
  );
}
