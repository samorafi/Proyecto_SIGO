import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  BellAlertIcon,
  
} from "@heroicons/react/24/solid";

// Importación de las vistas
import Docentes from "@/pages/docentes";
import Reportes from "@/pages/reportes";
import Bitacoras from "@/pages/bitacoras";
import Admin from "@/pages/admin";
import AdmUsuarios from "@/pages/admin/admUsuarios";
import AdmRolesPermisos from "@/pages/admin/admRolesPermisos";
import Notificaciones from "@/pages/notificaciones";
import Nomina from "@/pages/nomina";
import OfertasIndex from "@/pages/ofertas";
import OfertasPresencial from "@/pages/ofertas/presencial";
import OfertasVirtual from "@/pages/ofertas/virtual";
import Perfil from "@/pages/perfil";
import SignIn from "@/pages/auth/sign-in";

export const routes = [
  {
    layout: "dashboard",
    pages: [
      // Vistas principales: Ordenadas según su aparición en el menú lateral.
      { icon: <HomeIcon className="h-5 w-5" />, name: "Ofertas", path: "/ofertas", element: <OfertasIndex /> },
      { icon: <UsersIcon className="h-5 w-5" />, name: "Docentes", path: "/docentes", element: <Docentes /> },
      { icon: <ClipboardDocumentListIcon className="h-5 w-5" />, name: "Reportes", path: "/reportes", element: <Reportes /> },
      { icon: <BookOpenIcon className="h-5 w-5" />, name: "Bitácoras", path: "/bitacoras", element: <Bitacoras /> },
      { icon: <ClipboardDocumentListIcon className="h-5 w-5" />, name: "Nómina", path: "/nomina", element: <Nomina /> },
      { icon: <BellAlertIcon className="h-5 w-5" />, name: "Notificaciones", path: "/notificaciones", element: <Notificaciones /> },
      { icon: <Cog6ToothIcon className="h-5 w-5" />, name: "Administración del sistema", path: "/admin", element: <Admin /> },

      // Vistas secundarias (Ocultas en el menú): Utilizadas para redirecciones desde otras vistas.
      { name: "Ofertas Presencial", path: "/ofertas/presencial", element: <OfertasPresencial />, hidden: true },
      { name: "Ofertas Virtual", path: "/ofertas/virtual", element: <OfertasVirtual />, hidden: true },
      { name: "Administrar Usuarios", path: "/admin/admUsuarios", element: <AdmUsuarios />, hidden: true },
      { name: "Administrar Roles", path: "/admin/admRolesPermisos", element: <AdmRolesPermisos />, hidden: true },
      { name: "Mi perfil", path: "/perfil", element: <Perfil />, hidden: true },
    ],
  },

  {
    layout: "auth",
    pages: [
      // Vistas de autenticación
      { name: "sign in", path: "/sign-in", element: <SignIn /> },
    ],
  },
];

export default routes;
