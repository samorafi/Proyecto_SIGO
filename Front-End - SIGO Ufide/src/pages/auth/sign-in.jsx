import { useState } from "react";
import { Card, Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Opcional: “sesión” mock para cuando quieras poner un guard
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("user", JSON.stringify({ email: "usuario@ufide.ac.cr" }));

    // Pequeño delay para ver feedback (opcional)
    setTimeout(() => {
      navigate("/dashboard/ofertas", { replace: true });
    }, 300);
  };

  return (
    <section className="min-h-screen grid lg:grid-cols-5">
      {/* PANEL IZQUIERDO CON IMAGEN DEL EDIFICIO */}
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

      {/* FORMULARIO (DERECHA) */}
      <div className="lg:col-span-3 flex justify-center items-center p-6">
        <Card shadow={true} className="w-full max-w-2xl p-8 rounded-2xl shadow-lg border-t-4 border-[#2B338C]">
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
              {/* Correo */}
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
                />
              </div>

              {/* Contraseña */}
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
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Checkbox
                defaultChecked
                containerProps={{ className: "-ml-2.5" }}
                label={<Typography variant="small" color="gray" className="font-medium">Recordarme</Typography>}
              />
              <Typography variant="small" className="font-medium text-[#2B338C] hover:underline cursor-pointer">
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

            <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-6">
              ¿No tienes cuenta?
              <Link to="/auth/sign-up" className="ml-1 text-[#00A2E8] hover:text-[#7A26B2]">
                Crear cuenta
              </Link>
            </Typography>
          </form>
        </Card>
      </div>
    </section>
  );
}
