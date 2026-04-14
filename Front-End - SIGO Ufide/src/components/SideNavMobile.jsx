// src/widgets/layout/navbar.jsx
import { Navbar as MTNavbar, Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export default function SideNavMobile() {
  return (
    <MTNavbar className="rounded-xl border-0 shadow-md !bg-[#2B338C] px-4 py-3" fullWidth>
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/img/ufide-logo.svg" alt="UFIDÉ" className="h-7 w-auto" />
          <Typography className="text-white font-extrabold tracking-wide">
            Universidad Fidélitas
          </Typography>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/auth/sign-in">
            <Button variant="text" className="text-white">Iniciar sesión</Button>
          </Link>
          <Link to="/auth/sign-up">
            <Button className="font-bold" style={{ background: "#FFDA00", color: "#2B338C" }}>
              Crear cuenta
            </Button>
          </Link>
        </div>
      </div>
      <div className="h-1 mt-3 rounded-full" style={{ background: "#FFDA00" }} />
    </MTNavbar>
  );
}
