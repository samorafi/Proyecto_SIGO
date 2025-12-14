import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  BellAlertIcon,
  
} from "@heroicons/react/24/solid";

// Importación de las vistas
import Docentes from "@/pages/docentes/DocentesPage";
import Reportes from "@/pages/reportes";
import BitacoraAuditoria from "@/pages/bitacoras";  
import Admin from "@/pages/admin";
import AdmUsuarios from "@/pages/admin/admUsuarios";
import AdmRolesPermisos from "@/pages/admin/admRolesPermisos";
import Notificaciones from "@/pages/notificaciones";
import Perfil from "@/pages/perfil";
import SignIn from "@/pages/auth/sign-in";
import Coordinadores from "@/pages/admin/admCoordinadores";

// Administración del sistema.

// Submódulo de parametros del sistema
import ParametrosSistema from "@/pages/parametros/ParametrosSistema";
import CatalogoCarreras from "@/pages/parametros/CatalogoCarreras";
import CatalogoCursos from "@/pages/parametros/CatalogoCursos";
import CatalogoPeriodos from "@/pages/parametros/CatalogoPeriodos";

// Módulo de Configuración SMTP
import ConfiguracionCorreo from "@/pages/admin/admSMTP";

// Módulo de Ofertas En Línea
import OfertasEnLinea from "@/pages/ofertas/OfertasEnLinea";
import OfertasPresencialesVirtuales from "@/pages/ofertas/OfertasPresencialesVirtuales";
import OfertasHistorico from "@/pages/ofertas/OfertasHistorico";

// Importación de datos
import ImportarDatosPrincipal from "@/pages/importar/importarDatosPrincipal";

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
          { name: "Histórico De Ofertas", path: "/ofertas/OfertasHistorico", element: <OfertasHistorico />}
        ],
      },
      { icon: <UsersIcon className="h-5 w-5" />, name: "Docentes", path: "/docentes/DocentesPage", element: <Docentes /> },
      { icon: <ClipboardDocumentListIcon className="h-5 w-5" />, name: "Reportes", path: "/reportes", element: <Reportes /> },
      { icon: <BellAlertIcon className="h-5 w-5" />, name: "Notificaciones", path: "/notificaciones", element: <Notificaciones /> },
      { icon: <Cog6ToothIcon className="h-5 w-5" />, name: "Administración del sistema", path: "/admin", element: <Admin /> },

      // Vistas secundarias (Ocultas en el menú): Utilizadas para redirecciones desde otras vistas.
      { name: "Administrar Usuarios", path: "/admin/admUsuarios", element: <AdmUsuarios />, hidden: true },
      { name: "Administrar Roles", path: "/admin/admRolesPermisos", element: <AdmRolesPermisos />, hidden: true },
      { name: "Mi perfil", path: "/perfil", element: <Perfil />, hidden: true },
      { name: "Parámetros del sistema", path: "parametros", element: <ParametrosSistema />, hidden: true },
      { name: "Carreras", path: "catalogos/carreras", element: <CatalogoCarreras />, hidden: true },
      { name: "Cursos", path: "catalogos/cursos", element: <CatalogoCursos />, hidden: true },
      { name: "Periodos", path: "catalogos/periodos", element: <CatalogoPeriodos />, hidden: true },
      { name: "Configuración SMTP", path: "/admin/admSMTP", element: <ConfiguracionCorreo />, hidden: true },
      { name: "Bitácoras", path: "/bitacoras", element: <BitacoraAuditoria />, hidden: true },
      { name: "Importar Datos", path: "/admin/importarDatos", element: <ImportarDatosPrincipal />, hidden: true },
      { name: "Coordinadores", path: "/admin/admCoordinadores", element: <Coordinadores />, hidden: true },

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
