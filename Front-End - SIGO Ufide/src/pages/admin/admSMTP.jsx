import { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Switch,
} from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/services/apiClientService";

const API = import.meta.env.VITE_API_BASE ?? "";
const URL = {
  conf: `${API}/api/ConfSmtp`,
  test: `${API}/api/ConfSmtp/test`,
};

export default function AdmSMTP() {
  const navigate = useNavigate();

  // Estado principal de configuración
  const [config, setConfig] = useState({
    host: "",
    username: "",
    port: 587,
    enableSsl: true,
    senderName: "",
    senderEmail: "",
    password: "",
    useDefaultCredentials: false,
  });

  const [correoPrueba, setCorreoPrueba] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [err, setErr] = useState("");

  // 🔹 Obtener configuración actual
  const fetchConfig = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await apiFetch(URL.conf);
      if (!res.ok) throw new Error("Error al obtener configuración SMTP");
      const data = await res.json();
      setConfig((prev) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar la configuración SMTP.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Guardar configuración
  const handleSave = async () => {
    if (!config.host || !config.username || !config.password) {
      alert("Por favor complete los campos obligatorios: Servidor, Usuario y Contraseña.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(URL.conf, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al guardar configuración");
      alert("Configuración SMTP guardada correctamente.");
      fetchConfig();
    } catch (e) {
      console.error(e);
      alert("Error al guardar la configuración SMTP.");
    } finally {
      setSaving(false);
    }
  };

  // Probar conexión SMTP
  const handleTest = async () => {
    if (!correoPrueba) {
      alert("Ingrese un correo de destino.");
      return;
    }
    setTesting(true);
    try {
      const res = await apiFetch(URL.test, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: correoPrueba }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al probar conexión.");
      alert(data.message);
    } catch (e) {
      console.error(e);
      alert("Error al probar la conexión SMTP.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Configuración de Correo SMTP
          </Typography>
          <Typography className="text-blue-gray-600">
            Consola de configuración y prueba
          </Typography>
        </div>
        <Button
          variant="outlined"
          className="flex items-center gap-2 border-[#2B338C] text-[#2B338C] hover:bg-[#FFFFFF]/20 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Regresar
        </Button>
      </div>

      {/* Formulario */}
      <Card className="p-6 space-y-4 shadow-lg">
        {loading ? (
          <Typography color="gray">Cargando configuración...</Typography>
        ) : err ? (
          <Typography color="red">{err}</Typography>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Servidor (Host)"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
              />
              <Input
                label="Puerto"
                type="number"
                value={config.port}
                onChange={(e) =>
                  setConfig({ ...config, port: Number(e.target.value) })
                }
              />
              <Input
                label="Usuario SMTP (Username)"
                value={config.username}
                onChange={(e) =>
                  setConfig({ ...config, username: e.target.value })
                }
              />
              <Input
                label="Nombre Remitente"
                value={config.senderName}
                onChange={(e) =>
                  setConfig({ ...config, senderName: e.target.value })
                }
              />
              <Input
                label="Correo Remitente (From)"
                value={config.senderEmail}
                onChange={(e) =>
                  setConfig({ ...config, senderEmail: e.target.value })
                }
              />
              <Input
                label="Contraseña / API Key"
                type="password"
                value={config.password}
                onChange={(e) =>
                  setConfig({ ...config, password: e.target.value })
                }
              />

              <div className="flex items-center gap-2 mt-2">
                <Switch
                  id="enableSsl"
                  checked={config.enableSsl}
                  onChange={(e) =>
                    setConfig({ ...config, enableSsl: e.target.checked })
                  }
                />
                <label htmlFor="enableSsl">Usar SSL/TLS</label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button
                color="blue"
                className="bg-[#2B338C]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>

            <hr className="my-4" />

            <Typography variant="h6" className="text-[#2B338C]">
              Prueba de conexión SMTP
            </Typography>
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                label="Correo destino"
                value={correoPrueba}
                onChange={(e) => setCorreoPrueba(e.target.value)}
              />
              <Button
                color="green"
                onClick={handleTest}
                disabled={testing}
                className="bg-green-600"
              >
                {testing ? "Enviando..." : "Probar Conexión"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
