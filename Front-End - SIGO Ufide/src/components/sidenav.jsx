// src/widgets/layout/sidenav.jsx
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Typography, Button, Card, IconButton } from "@material-tailwind/react";
import { ArrowLeftOnRectangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Sidenav({
  routes,
  brandImg,
  brandName,
  isOpen = false,
  onClose = () => {},
}) {
  const navigate = useNavigate();

  // Traemos permisos + loadingPermisos + hasPermission desde AuthContext
  const { user, logout, loading, loadingPermisos, hasPermission } = useAuth();

  // Mostrar un indicador de carga mientras se verifica el estado de autenticación / permisos
  if (loading || loadingPermisos)
    return <div className="flex items-center justify-center h-full">Cargando...</div>;

  const group = routes.find((r) => r.layout === "dashboard");

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/auth/sign-in", { replace: true });
  };

  const [openMenu, setOpenMenu] = useState(null);

  // Filtrar menú según permisos (y subpáginas en collapsible)
  const menuPages = useMemo(() => {
    const pages = (group?.pages ?? []).filter((p) => !p.hidden);

    return pages
      .map((item) => {
        // Si el item tiene permiso y no lo tiene → ocultar
        if (item.permiso && !hasPermission(item.permiso)) return null;

        // Si es collapsible, filtrar hijos también por permiso y hidden
        if (item.collapsible && Array.isArray(item.pages)) {
          const filteredChildren = item.pages.filter(
            (sub) => !sub.hidden && (!sub.permiso || hasPermission(sub.permiso))
          );

          // Si no queda nada permitido, ocultar el grupo completo
          if (filteredChildren.length === 0) return null;

          return { ...item, pages: filteredChildren };
        }

        return item;
      })
      .filter(Boolean);
  }, [group, hasPermission]);

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
        <Link to="/dashboard" className="flex flex-col items-start gap-2">
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
          {menuPages.map((item) => {
            if (item.collapsible) {
              return (
                <li key={item.name} className="text-sm">
                  <button
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
                    onClick={() => setOpenMenu(openMenu === item.name ? null : item.name)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openMenu === item.name && (
                    <ul className="ml-8 mt-1 flex flex-col gap-1">
                      {item.pages.map((sub) => (
                        <li key={sub.name}>
                          <NavLink
                            to={`/dashboard${sub.path}`}
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
                            <span className="text-sm">{sub.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            // Menú normal
            const fullPath = `/dashboard${item.path}`;
            return (
              <li key={item.name}>
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
                  <span className="grid place-items-center">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="h-px bg-white/15 mx-4" />

      {/* Usuario (abajo) */}
      <div className="p-4">
        <p className="text-sm font-semibold truncate">Bienvenido</p>
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user ? user.nombre : "Invitado"}</p>
            <p className="text-xs text-white/80 truncate">
              {user ? user.correo : "invitado@ufide.ac.cr"}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">{/* Perfil (comentado) */}</div>

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
