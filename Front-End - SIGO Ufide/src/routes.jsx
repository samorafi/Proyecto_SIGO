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
import OfertasEnLineaV2 from "@/pages/ofertas/OfertasEnLineaV2";
import OfertasPresencialesVirtuales from "@/pages/ofertas/OfertasPresencialesVirtuales";
import OfertasPresencialesVirtualesV2 from "@/pages/ofertas/OfertasPresencialesVirtualesV2";
import OfertasHistorico from "@/pages/ofertas/OfertasHistorico";
import OfertasHistoricoV2 from "@/pages/ofertas/OfertasHistoricoV2";


// Importación de datos
//import ImportarDatosPrincipal from "@/pages/admin/admImportarDatos/importarDatosPrincipal";

export const routes = [
  {
    layout: "dashboard",
    pages: [
      // Vistas principales: Ordenadas según su aparición en el menú lateral.
      {
        icon: <HomeIcon className="h-5 w-5" />,
        name: "Ofertas",
        collapsible: true,
        permiso: "OFERTAS_VIEW",
        pages: [
          { name: "100% Virtual", path: "/ofertas/OfertasEnLinea", element: <OfertasEnLinea />, permiso: "OFERTAS_VIRTUALES_VIEW" },
          { name: "Presencial Y En Línea", path: "/ofertas/OfertasPresencialesVirtuales", element: <OfertasPresencialesVirtuales />, permiso: "OFERTAS_PRESENCIAL_EN_LINEA_VIEW" },
          { name: "Histórico De Ofertas", path: "/ofertas/OfertasHistorico", element: <OfertasHistorico />, permiso: "HISTORICO_VIEW" },
          { name: "Histórico De Ofertas V2", path: "/ofertas/OfertasHistoricoV2", element: <OfertasHistoricoV2 />, permiso: "HISTORICO_VIEW" },
          { name: "100% Virtual V2", path: "/ofertas/OfertasEnLineaV2", element: <OfertasEnLineaV2 />, permiso: "OFERTAS_VIRTUALES_VIEW" },
          { name: "Presencial Y En Línea V2", path: "/ofertas/OfertasPresencialesVirtualesV2", element: <OfertasPresencialesVirtualesV2 />, permiso: "OFERTAS_PRESENCIAL_EN_LINEA_VIEW" },
        ],
      },
      { icon: <UsersIcon className="h-5 w-5" />, name: "Docentes", path: "/docentes/DocentesPage", element: <Docentes />, permiso: "DOCENTES_VIEW" },
      { icon: <ClipboardDocumentListIcon className="h-5 w-5" />, name: "Reportes", path: "/reportes", element: <Reportes />, permiso: "REPORTES_VIEW" },
      { icon: <BellAlertIcon className="h-5 w-5" />, name: "Notificaciones", path: "/notificaciones", element: <Notificaciones />, permiso: "NOTIFICACIONES_VIEW" },
      { icon: <Cog6ToothIcon className="h-5 w-5" />, name: "Administración del sistema", path: "/admin", element: <Admin />, permiso: "ADMIN_VIEW" },

      // Vistas secundarias (Ocultas en el menú): Utilizadas para redirecciones desde otras vistas.
      { name: "Administrar Usuarios", path: "/admin/admUsuarios", element: <AdmUsuarios />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Administrar Roles", path: "/admin/admRolesPermisos", element: <AdmRolesPermisos />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Mi perfil", path: "/perfil", element: <Perfil />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Parámetros del sistema", path: "parametros", element: <ParametrosSistema />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Carreras", path: "catalogos/carreras", element: <CatalogoCarreras />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Cursos", path: "catalogos/cursos", element: <CatalogoCursos />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Periodos", path: "catalogos/periodos", element: <CatalogoPeriodos />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Configuración SMTP", path: "/admin/admSMTP", element: <ConfiguracionCorreo />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Bitácoras", path: "/bitacoras", element: <BitacoraAuditoria />, hidden: true, permiso: "ADMIN_VIEW" },
      //{ name: "Importar Datos", path: "/admin/importarDatos", element: <ImportarDatosPrincipal />, hidden: true, permiso: "ADMIN_VIEW"  },
      { name: "Coordinadores", path: "/admin/admCoordinadores", element: <Coordinadores />, hidden: true, permiso: "ADMIN_VIEW" },

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
