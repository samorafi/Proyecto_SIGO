import { Routes, Route, Navigate } from "react-router-dom";
import routes from "@/routes";
import { Dashboard, Auth } from "@/layouts";
import ProtectedLayout from "@/components/ProtectedLayout";

export default function App() {
  const dash = routes.find((r) => r.layout === "dashboard") ?? { pages: [] };
  const auth = routes.find((r) => r.layout === "auth") ?? { pages: [] };

  return (
    <Routes>
      {/* Layout del dashboard protegido */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      >
        {dash.pages.flatMap((page) => {
          // Si tiene subpáginas (caso: Ofertas)
          if (page.pages) {
            return page.pages.map((sub) => (
              <Route
                key={sub.path}
                path={sub.path.replace(/^\//, "")}
                element={sub.element}
              />
            ));
          }

          // Si es una página normal (no requiere subpáginas)
          return (
            <Route
              key={page.path}
              path={page.path.replace(/^\//, "")}
              element={page.element}
            />
          );
        })}


        {/* /dashboard => /dashboard/ofertas */}
        <Route index element={<Navigate to="ofertas" replace />} />
      </Route>

      {/* Layout de auth (sin sidenav) */}
      <Route path="/auth/*" element={<Auth />}>
        {auth.pages.map(({ path, element }) => (
          <Route key={path} path={path.replace(/^\//, "")} element={element} />
        ))}

        {/* /auth => /auth/sign-in */}
        <Route index element={<Navigate to="sign-in" replace />} />

      </Route>

      {/* fallback global: Pagina principal al iniciar el programa */}
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />

    </Routes>
  );
}
