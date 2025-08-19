// src/pages/perfil.jsx
import { useRef, useState } from "react";
import {
  Card, Button, Typography, Avatar, Tooltip,
} from "@material-tailwind/react";
import {
  CameraIcon, TrashIcon, CheckCircleIcon,
} from "@heroicons/react/24/outline";

/* ===== Mock de usuario (solo UI) ===== */
const USER = {
  nombre: "Usuario Demo",
  correo: "usuario@ufide.ac.cr",
  telefono: "8888-0000",
  genero: "M",
  cedula: "1-1234-5678",
  domicilio: { provincia: "San José", canton: "Montes de Oca" },
  categoria: "Tiempo Parcial",
  estado: "Activo",
  sede: "San Pedro",
  ingreso: "2019-02-10",
  contratacion: "Servicios profesionales",
  atestados: "MSc. Informática",
  avatar: "/img/Profile-Holder.png",
};

const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${className}`}>{children}</span>
);

function Info({ label, value }) {
  return (
    <div className="text-sm">
      <p className="text-blue-gray-500">{label}</p>
      <div className="font-medium">{value}</div>
    </div>
  );
}

export default function Perfil() {
  const fileRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(USER.avatar);
  const [pendingFile, setPendingFile] = useState(null);
  const [saved, setSaved] = useState(false);

  const onPick = () => fileRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
    setPendingFile(f);
    setSaved(false);
  };

  const onRemove = () => {
    setAvatarUrl("/img/Profile-Holder.png");
    setPendingFile({ removed: true }); // solo UI
    setSaved(false);
    // opcional: limpiar input
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSavePhoto = () => {
    // Solo UI: “guardar”
    setSaved(true);
    // aquí en la vida real subirías a tu backend y luego revocarías el objectURL
    // if (pendingFile && typeof avatarUrl === "string") URL.revokeObjectURL(avatarUrl);
    setPendingFile(null);
  };

  return (
    <div className="p-2 md:p-6 space-y-4">
      <div>
        <Typography className="text-2xl font-extrabold text-[#2B338C]">Mi perfil</Typography>
        <Typography className="text-blue-gray-600">Visualiza tus datos. Solo puedes actualizar tu foto por ahora.</Typography>
      </div>

      {/* Header / Card principal */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Foto + acciones */}
          <div className="flex flex-col items-center gap-3">
            <Avatar src={avatarUrl} alt={USER.nombre} className="h-28 w-28" />
            <div className="flex items-center gap-2">
              <Tooltip content="Cambiar foto">
                <Button variant="outlined" className="border-[#2B338C] text-[#2B338C] flex items-center gap-2"
                        onClick={onPick}>
                  <CameraIcon className="h-5 w-5" /> Cambiar
                </Button>
              </Tooltip>
              <Tooltip content="Quitar foto">
                <Button variant="outlined" className="border-red-500 text-red-600 flex items-center gap-2"
                        onClick={onRemove}>
                  <TrashIcon className="h-5 w-5" /> Quitar
                </Button>
              </Tooltip>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />

            <Button
              disabled={!pendingFile}
              onClick={onSavePhoto}
              className="bg-[#FFDA00] text-[#2B338C] mt-1 flex items-center gap-2 disabled:opacity-60"
            >
              <CheckCircleIcon className="h-5 w-5" /> Guardar foto
            </Button>

            {saved && (
              <span className="text-xs text-emerald-700 mt-1">Foto actualizada</span>
            )}
          </div>

          {/* Nombre + correo + estado */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <Typography className="text-xl font-bold">{USER.nombre}</Typography>
                <Typography className="text-sm text-blue-gray-600">{USER.correo}</Typography>
              </div>
              <div className="flex items-center gap-2">
                <Pill className="bg-emerald-600">ACTIVO</Pill>
                <Pill className="bg-[#2B338C]">{USER.categoria}</Pill>
                <Pill className="bg-indigo-600">{USER.sede}</Pill>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <Info label="Teléfono" value={USER.telefono} />
              <Info label="Cédula" value={USER.cedula} />
              <Info label="Género" value={USER.genero} />
            </div>
          </div>
        </div>
      </Card>

      {/* Datos personales */}
      <Card className="p-4 md:p-6">
        <Typography className="font-semibold text-[#2B338C] mb-4">Datos personales</Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Info label="Provincia" value={USER.domicilio.provincia} />
          <Info label="Cantón" value={USER.domicilio.canton} />
          <Info label="Correo" value={USER.correo} />
        </div>
      </Card>

      {/* Datos académicos/laborales */}
      <Card className="p-4 md:p-6">
        <Typography className="font-semibold text-[#2B338C] mb-4">Vinculación académica</Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Info label="Ingreso" value={USER.ingreso} />
          <Info label="Contratación" value={USER.contratacion} />
          <Info label="Atestados" value={USER.atestados} />
        </div>
      </Card>
    </div>
  );
}
