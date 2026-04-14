import { Routes, Route, Navigate } from "react-router-dom";
import routes from "@/routes";
import { Dashboard, Auth } from "@/layouts";
import ProtectedLayout from "@/components/ProtectedLayout";
import RequirePermission from "@/guards/RequirePermission";
import HomePage from "@/pages/HomePage";

function wrapWithPermission(element, permiso) {
  if (!permiso) return element;
  return <RequirePermission permiso={permiso}>{element}</RequirePermission>;
}

export default function App() {
  const dash = routes.find((r) => r.layout === "dashboard") ?? { pages: [] };
  const auth = routes.find((r) => r.layout === "auth") ?? { pages: [] };

  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      >
        {dash.pages.flatMap((page) => {
          if (page.pages) {
            return page.pages.map((sub) => (
              <Route
                key={sub.path}
                path={sub.path.replace(/^\//, "")}
                element={wrapWithPermission(sub.element, sub.permiso ?? page.permiso)}
              />
            ));
          }

          return (
            <Route
              key={page.path}
              path={page.path.replace(/^\//, "")}
              element={wrapWithPermission(page.element, page.permiso)}
            />
          );
        })}

        <Route index element={<HomePage />} />
      </Route>

      <Route path="/auth/*" element={<Auth />}>
        {auth.pages.map(({ path, element }) => (
          <Route key={path} path={path.replace(/^\//, "")} element={element} />
        ))}
        <Route index element={<Navigate to="sign-in" replace />} />
      </Route>

      {/* Ruta de no autorizado */}
      <Route path="/403" element={<div className="p-10">No autorizado (403)</div>} />

      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
}
