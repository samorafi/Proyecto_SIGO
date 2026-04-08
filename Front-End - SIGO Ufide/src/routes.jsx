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
import OfertasEnLineaDetalle from "@/pages/ofertas/OfertasEnLineaDetalle";
import OfertasPresencialesVirtualesDetalle from "@/pages/ofertas/OfertasPresencialesVirtualesDetalle";
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
        permiso: "OFERTAS_VIEW",
        pages: [
          { name: "Histórico De Ofertas", path: "/ofertas/OfertasHistoricoV2", element: <OfertasHistorico />, permiso: "HISTORICO_VIEW" },
          { name: "100% Virtual", path: "/ofertas/OfertasEnLineaV2", element: <OfertasEnLinea />, permiso: "OFERTAS_VIRTUALES_VIEW" },
          { name: "Presencial Y En Línea", path: "/ofertas/OfertasPresencialesVirtualesV2", element: <OfertasPresencialesVirtuales />, permiso: "OFERTAS_PRESENCIAL_EN_LINEA_VIEW" },
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
      { name: "Ofertas 100% Virtual por período", path: "/ofertas/OfertasEnLineaV2/periodo/:periodoId", element: <OfertasEnLineaDetalle />, hidden: true, permiso: "OFERTAS_VIRTUALES_VIEW" },
      { name: "Ofertas Presencial y En Línea por período", path: "/ofertas/OfertasPresencialesVirtualesV2/periodo/:periodoId", element: <OfertasPresencialesVirtualesDetalle />, hidden: true, permiso: "OFERTAS_PRESENCIAL_EN_LINEA_VIEW" },
      { name: "Configuración SMTP", path: "/admin/admSMTP", element: <ConfiguracionCorreo />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Bitácoras", path: "/bitacoras", element: <BitacoraAuditoria />, hidden: true, permiso: "ADMIN_VIEW" },
      { name: "Importar Datos", path: "/admin/importarDatos", element: <ImportarDatosPrincipal />, hidden: true, permiso: "ADMIN_VIEW" },
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
