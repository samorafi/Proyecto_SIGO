import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  BellAlertIcon,
} from "@heroicons/react/24/solid";

import Docentes from "@/pages/docentes";
import Reportes from "@/pages/reportes";
import Bitacoras from "@/pages/bitacoras";
import Admin from "@/pages/admin";
import Notificaciones from "@/pages/notificaciones";

import OfertasIndex from "@/pages/ofertas";
import OfertasPresencial from "@/pages/ofertas/presencial";
import OfertasVirtual from "@/pages/ofertas/virtual";
import Perfil from "@/pages/perfil";

import SignIn from "@/pages/auth/sign-in";
import SignUp from "@/pages/auth/sign-up";

export const routes = [
  {
    layout: "dashboard",
    pages: [
      { icon: <HomeIcon className="h-5 w-5" />, name: "Ofertas", path: "/ofertas", element: <OfertasIndex /> },
      { name: "Ofertas Presencial", path: "/ofertas/presencial", element: <OfertasPresencial />, hidden: true },
      { name: "Ofertas Virtual", path: "/ofertas/virtual", element: <OfertasVirtual />, hidden: true },

      { icon: <UsersIcon className="h-5 w-5" />, name: "Docentes", path: "/docentes", element: <Docentes /> },
      { icon: <ClipboardDocumentListIcon className="h-5 w-5" />, name: "Reportes", path: "/reportes", element: <Reportes /> },
      { icon: <BookOpenIcon className="h-5 w-5" />, name: "Bitácoras", path: "/bitacoras", element: <Bitacoras /> },
      { icon: <BellAlertIcon className="h-5 w-5" />, name: "Notificaciones", path: "/notificaciones", element: <Notificaciones /> },
      { icon: <Cog6ToothIcon className="h-5 w-5" />, name: "Administración del sistema", path: "/admin", element: <Admin /> },
      { name: "Mi perfil", path: "/perfil", element: <Perfil />, hidden: true },
    ],
  },

  {
    layout: "auth",
    pages: [
      { name: "sign in", path: "/sign-in", element: <SignIn /> },
      { name: "sign up", path: "/sign-up", element: <SignUp /> },
    ],
  },
];

export default routes;
