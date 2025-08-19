// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "@/routes";
import { Dashboard, Auth } from "@/layouts";

export default function App() {
  const dash = routes.find((r) => r.layout === "dashboard") ?? { pages: [] };
  const auth = routes.find((r) => r.layout === "auth") ?? { pages: [] };

  return (
    <Routes>
      {/* Layout del dashboard */}
      <Route path="/dashboard/*" element={<Dashboard />}>
        {dash.pages.map(({ path, element }) => (
          <Route key={path} path={path.replace(/^\//, "")} element={element} />
        ))}
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

      {/* fallback global */}
      <Route path="*" element={<Navigate to="/dashboard/ofertas" replace />} />

      <Route path="/auth/*" element={<Auth />}>
        {auth.pages.map(({ path, element }) => (
          <Route key={path} path={path.replace(/^\//, "")} element={element} />
        ))}
        {/* /auth => /auth/sign-in */}
        <Route index element={<Navigate to="sign-in" replace />} />
      </Route>
    </Routes>
  );
}
