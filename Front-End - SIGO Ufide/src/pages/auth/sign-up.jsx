import { Card, Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";

export function SignUp() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault(); // evita reload
    // TODO: aquí podrías validar y llamar a tu API
    navigate("/auth/sign-in"); // redirige al login
  };

  return (
    <section className="min-h-screen grid lg:grid-cols-5">
      {/* FORMULARIO (IZQUIERDA) */}
      <div className="lg:col-span-3 flex justify-center items-center p-6">
        <Card shadow={true} className="w-full max-w-2xl p-8 rounded-2xl shadow-lg border-t-4 border-[#2B338C]">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mb-2 text-[#2B338C]">
              Formulario de registro
            </Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-lg">
              Ingresa tus datos para crear la cuenta.
            </Typography>
          </div>

          <form className="mt-8" onSubmit={handleRegister}>
            {/* Grid: 2 columnas en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Nombre
                </Typography>
                <Input
                  size="lg"
                  type="text"
                  placeholder="Juan"
                  autoComplete="given-name"
                  containerProps={{ className: "mt-3" }}
                  className="!border-t-[#2B338C] focus:!border-t-[#FFDA00]"
                  labelProps={{ className: "before:content-none after:content-none" }}
                />
              </div>

              {/* Apellido */}
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Apellido
                </Typography>
                <Input
                  size="lg"
                  type="text"
                  placeholder="Pérez"
                  autoComplete="family-name"
                  containerProps={{ className: "mt-3" }}
                  className="!border-t-[#2B338C] focus:!border-t-[#FFDA00]"
                  labelProps={{ className: "before:content-none after:content-none" }}
                />
              </div>

              {/* Correo */}
              <div className="md:col-span-2">
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
                />
              </div>

              {/* Contraseña */}
              <div className="md:col-span-2">
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Contraseña
                </Typography>
                <Input
                  size="lg"
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  containerProps={{ className: "mt-3" }}
                  className="!border-t-[#2B338C] focus:!border-t-[#FFDA00]"
                  labelProps={{ className: "before:content-none after:content-none" }}
                />
              </div>
            </div>

            {/* Acepto TyC */}
            <div className="mt-3">
              <Checkbox
                defaultChecked
                containerProps={{ className: "-ml-2.5" }}
                label={
                  <Typography variant="small" color="gray" className="font-medium">
                    Acepto los{" "}
                    <a href="#" className="underline text-[#00A2E8] hover:text-[#7A26B2]">
                      Términos y condiciones
                    </a>
                  </Typography>
                }
              />
            </div>

            {/* Botón */}
            <Button
              type="submit"
              className="mt-4 font-bold bg-[#FFDA00] text-[#2B338C] hover:bg-[#2B338C] hover:text-white"
              fullWidth
            >
              Realizar registro
            </Button>

            <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-6">
              ¿Tienes una cuenta?
              <Link to="/auth/sign-in" className="ml-1 text-[#00A2E8] hover:text-[#7A26B2]">
                Iniciar sesión
              </Link>
            </Typography>
          </form>
        </Card>
      </div>

      {/* PANEL CON IMAGEN (DERECHA) */}
      <div className="hidden lg:block lg:col-span-2 relative">
        <img
          src="/img/Campus-3.png"
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
    </section>
  );
}

export default SignUp;
