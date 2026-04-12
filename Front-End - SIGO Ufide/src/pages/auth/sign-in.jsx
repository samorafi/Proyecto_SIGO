import { useState } from "react";
import { Card, Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/hooks/useAlert";
import PasswordResetModal from "./modals/PasswordResetModal";
import { apiFetch } from "@/services/apiClientService";

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [openReset, setOpenReset] = useState(false);
  const { login } = useAuth();
  const alert = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert.loading("Iniciando sesión...", "Validando credenciales");
    setLoading(true);

    try {
      const res = await apiFetch("/api/Autenticacion/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo,
          contrasena,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        let errorData = null;

        try {
          errorData = await res.json();
        } catch {
          // Ignorar si la respuesta no viene en JSON
        }

        if (res.status === 401) {
          throw new Error("Correo o contraseña incorrectos.");
        }

        throw new Error(errorData?.message || "No se pudo iniciar sesión.");
      }

      const ok = await login();

      if (!ok) {
        throw new Error("No se pudo validar la sesión después del login.");
      }

      alert.close();
      alert.toastSuccess("Bienvenido");
      navigate("/dashboard/", { replace: true });
    } catch (error) {
      alert.close();
      alert.error(
        "No se pudo iniciar sesión",
        error?.message || "Ocurrió un error inesperado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen grid lg:grid-cols-5">
      <div className="hidden lg:block lg:col-span-2 relative">
        <img
          src="/img/Campus-1.png"
          alt="Universidad Fidélitas"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#2B338C]/60"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-8">
          <h2 className="text-3xl font-extrabold">Universidad Fidélitas</h2>
          <p className="mt-2 opacity-90">Innovación, tecnología y futuro.</p>
          <span className="inline-block mt-4 h-1 w-24 bg-[#FFDA00] rounded"></span>
        </div>
      </div>

      <div className="lg:col-span-3 flex justify-center items-center p-6">
        <Card
          shadow={true}
          className="w-full max-w-2xl p-8 rounded-2xl shadow-lg border-t-4 border-[#2B338C]"
        >
          <div className="text-center">
            <Typography variant="h2" className="font-bold mb-2 text-[#2B338C]">
              Iniciar sesión
            </Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-lg">
              Ingresa tu correo y contraseña para continuar.
            </Typography>
          </div>

          <form className="mt-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Correo electrónico
                </Typography>
                <Input
                  size="lg"
                  type="email"
                  placeholder="name@mail.com"
                  autoComplete="email"
                  containerProps={{ className: "mt-3" }}
                  className="!border-t-[#2B338C] focus:!border-t-[#FFDA00]"
                  labelProps={{ className: "before:content-none after:content-none" }}
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Contraseña
                </Typography>
                <Input
                  size="lg"
                  type="password"
                  placeholder="********"
                  autoComplete="current-password"
                  containerProps={{ className: "mt-3" }}
                  className="!border-t-[#2B338C] focus:!border-t-[#FFDA00]"
                  labelProps={{ className: "before:content-none after:content-none" }}
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Typography
                variant="small"
                className="font-medium text-[#2B338C] hover:underline cursor-pointer"
                onClick={() => setOpenReset(true)}
              >
                ¿Olvidaste tu contraseña?
              </Typography>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 font-bold bg-[#FFDA00] text-[#2B338C] hover:bg-[#2B338C] hover:text-white disabled:opacity-70"
              fullWidth
            >
              {loading ? "Entrando..." : "Iniciar sesión"}
            </Button>
          </form>
        </Card>
      </div>

      <PasswordResetModal
        open={openReset}
        onClose={() => setOpenReset(false)}
        initialEmail={correo}
      />
    </section>
  );
}