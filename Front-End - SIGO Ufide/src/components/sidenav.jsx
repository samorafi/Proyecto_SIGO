// src/widgets/layout/sidenav.jsx
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Typography, Avatar, Button, Card, IconButton } from "@material-tailwind/react";
import { ArrowLeftOnRectangleIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";


export default function Sidenav({ routes, brandImg, brandName, isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const group = routes.find((r) => r.layout === "dashboard");

  const handleLogout = () => {
    logout(); 
    onClose(); 
    navigate("/auth/sign-in", { replace: true });
  };

  const Content = ({ showClose = false }) => (
    <Card className="h-full w-full bg-[#2B338C] text-white rounded-2xl shadow-xl flex flex-col">
      {/* Brand */}
      <div className="p-4 relative">
        {showClose && (
          <IconButton
            variant="text"
            className="!absolute right-1 top-1 text-white/90"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </IconButton>
        )}
        <Link to="/" className="flex flex-col items-start gap-2">
          <img src={brandImg} alt="logo" className="h-10 w-auto object-contain" />
          <div className="leading-tight max-w-[180px]">
            <Typography className="font-bold">{brandName?.split(" (")[0] ?? "SIGO"}</Typography>
            <Typography className="text-sm opacity-80 -mt-0.5">SIGO</Typography>
          </div>
        </Link>
      </div>

      <div className="h-px bg-white/15 mx-4" />

      {/* Menú */}
      <nav className="px-3 py-3 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {(group?.pages ?? [])
            .filter((p) => !p.hidden)
            .map(({ icon, name, path }) => {
              const fullPath = `/${group.layout}${path}`;
              return (
                <li key={name}>
                  <NavLink
                    to={fullPath}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition",
                        isActive
                          ? "bg-[#FFDA00] text-[#2B338C] font-semibold shadow"
                          : "hover:bg-white/10",
                      ].join(" ")
                    }
                  >
                    <span className="grid place-items-center">{icon}</span>
                    <span className="text-sm">{name}</span>
                  </NavLink>
                </li>
              );
            })}
        </ul>
      </nav>

      <div className="h-px bg-white/15 mx-4" />

      {/* Usuario (abajo) */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar src="/img/Profile-Holder.png" alt="Usuario Demo" className="ring-2 ring-white/40" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Usuario Demo</p>
            <p className="text-xs text-white/80 truncate">usuario@ufide.ac.cr</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to="/dashboard/perfil" className="col-span-1">
            <Button
              variant="outlined"
              size="sm"
              className="w-full border-white/40 text-white hover:bg-white/10 flex items-center justify-center gap-1"
              onClick={onClose}
            >
              <UserCircleIcon className="h-5 w-5" />
              <span>Mi perfil</span>
            </Button>
          </Link>

          <div className="col-span-1" title="Cerrar sesión">
            <Button
              size="sm"
              onClick={handleLogout}
              className="w-full bg-[#FFDA00] text-[#2B338C] hover:brightness-95 flex items-center justify-center gap-1"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      {/* Desktop (lg+) fijo */}
      <aside className="hidden lg:block sticky top-0 h-screen w-full max-w-[280px] p-3">
        <Content />
      </aside>

      {/* Mobile (drawer + overlay) */}
      <div className={`${isOpen ? "fixed" : "hidden"} inset-0 z-50 lg:hidden`}>
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute left-0 top-0 h-full w-72 p-3">
          <Content showClose />
        </div>
      </div>
    </>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/Logo-Ufide-2.png",
  brandName: "Sistema Integral de Gestión de Ofertas (SIGO)",
};
