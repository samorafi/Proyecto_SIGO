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

// Administración del sistema.

// Submódulo de parametros del sistema
import ParametrosSistema from "@/pages/parametros/ParametrosSistema";
import CatalogoCarreras from "@/pages/parametros/CatalogoCarreras";
import CatalogoCursos from "@/pages/parametros/CatalogoCursos";
import CatalogoPeriodos from "@/pages/parametros/CatalogoPeriodos";

// Módulo de Ofertas En Línea
import OfertasEnLinea from "@/pages/ofertas/OfertasEnLinea";
import OfertasPresencialesVirtuales from "@/pages/ofertas/OfertasPresencialesVirtuales";

export const routes = [
  {
    layout: "dashboard",
    pages: [
      // Vistas principales: Ordenadas según su aparición en el menú lateral.
      {
        icon: <HomeIcon className="h-5 w-5" />,
        name: "Ofertas",
        collapsible: true, 
        pages: [
          { name: "100% Virtual", path: "/ofertas/OfertasEnLinea", element: <OfertasEnLinea /> },
          { name: "Presencial Y En Línea", path: "/ofertas/OfertasPresencialesVirtuales", element: <OfertasPresencialesVirtuales /> },
        ],
      },
      { icon: <UsersIcon className="h-5 w-5" />, name: "Docentes", path: "/docentes", element: <Docentes /> },
      { icon: <ClipboardDocumentListIcon className="h-5 w-5" />, name: "Reportes", path: "/reportes", element: <Reportes /> },
      { icon: <BellAlertIcon className="h-5 w-5" />, name: "Notificaciones", path: "/notificaciones", element: <Notificaciones /> },
      { icon: <Cog6ToothIcon className="h-5 w-5" />, name: "Administración del sistema", path: "/admin", element: <Admin /> },

      // Vistas secundarias (Ocultas en el menú): Utilizadas para redirecciones desde otras vistas.
      { name: "Ofertas Presencial", path: "/ofertas/presencial", element: <OfertasPresencial />, hidden: true },
      { name: "Ofertas Virtual", path: "/ofertas/virtual", element: <OfertasVirtual />, hidden: true },
      { name: "Administrar Usuarios", path: "/admin/admUsuarios", element: <AdmUsuarios />, hidden: true },
      { name: "Administrar Roles", path: "/admin/admRolesPermisos", element: <AdmRolesPermisos />, hidden: true },
      { name: "Mi perfil", path: "/perfil", element: <Perfil />, hidden: true },
      { name: "Parámetros del sistema", path: "parametros", element: <ParametrosSistema />, hidden: true },
      { name: "Carreras", path: "catalogos/carreras", element: <CatalogoCarreras />, hidden: true },
      { name: "Cursos", path: "catalogos/cursos", element: <CatalogoCursos />, hidden: true },
      { name: "Periodos", path: "catalogos/periodos", element: <CatalogoPeriodos />, hidden: true },
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
