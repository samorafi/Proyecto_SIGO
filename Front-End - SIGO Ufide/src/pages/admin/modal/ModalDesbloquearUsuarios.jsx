// src/pages/usuarios/modals/ModalDesbloquearUsuarios.jsx

import { useEffect, useState } from "react";
import { Button, Checkbox, Spinner } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";
import { useUsuariosBloqueados } from "../hooks/useUsuariosBloqueados";

export default function ModalDesbloquearUsuarios({ open, onClose }) {
  const {
    usuariosBloqueados,
    loading,
    unlocking,
    cargarUsuariosBloqueados,
    desbloquearUsuarios,
  } = useUsuariosBloqueados();

  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    if (open) {
      cargarUsuariosBloqueados();
      setSeleccionados([]);
    }
  }, [open, cargarUsuariosBloqueados]);

  const toggleUsuario = (usuarioId) => {
    setSeleccionados((prev) =>
      prev.includes(usuarioId)
        ? prev.filter((id) => id !== usuarioId)
        : [...prev, usuarioId]
    );
  };

  const toggleTodos = () => {
    if (seleccionados.length === usuariosBloqueados.length) {
      setSeleccionados([]);
      return;
    }

    setSeleccionados(usuariosBloqueados.map((u) => u.usuarioId));
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";

    return new Date(fecha).toLocaleString("es-CR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleDesbloquear = async () => {
    const result = await desbloquearUsuarios(seleccionados);

    if (result) {
      setSeleccionados([]);
    }
  };

  const todosSeleccionados =
    usuariosBloqueados.length > 0 &&
    seleccionados.length === usuariosBloqueados.length;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Desbloquear usuarios"
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
          <p className="text-xs text-gray-500">
            {seleccionados.length > 0
              ? `${seleccionados.length} usuario(s) seleccionado(s)`
              : "Seleccioná los usuarios que querés desbloquear"}
          </p>

          <div className="flex gap-2">
            <Button
              variant="text"
              className="text-gray-700"
              onClick={onClose}
              disabled={unlocking}
            >
              Cerrar
            </Button>

            <Button
              className="bg-[#2B338C] hover:bg-[#20276d]"
              onClick={handleDesbloquear}
              disabled={unlocking || seleccionados.length === 0}
            >
              Desbloquear
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-[#2B338C] font-bold text-sm">
            Usuarios actualmente bloqueados
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Al desbloquearlos, se limpiarán los intentos fallidos y la fecha de bloqueo.
          </p>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex justify-center">
            <Spinner className="h-8 w-8 text-[#2B338C]" />
          </div>
        ) : usuariosBloqueados.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-[#2B338C] font-bold">
              No hay usuarios bloqueados
            </p>
            <p className="text-gray-500 text-sm mt-1">
              No se han detectado usuarios bloqueados en este momento.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
              <p className="text-sm font-semibold text-[#2B338C]">
                {usuariosBloqueados.length} usuario(s) bloqueado(s)
              </p>

              <Button
                size="sm"
                variant="outlined"
                className="border-[#2B338C] text-[#2B338C]"
                onClick={toggleTodos}
              >
                {todosSeleccionados ? "Quitar todos" : "Seleccionar todos"}
              </Button>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {usuariosBloqueados.map((u) => {
                const checked = seleccionados.includes(u.usuarioId);

                return (
                  <div
                    key={u.usuarioId}
                    onClick={() => toggleUsuario(u.usuarioId)}
                    className={`grid grid-cols-[auto_1fr] md:grid-cols-[auto_1.4fr_1.4fr_0.7fr_1.2fr] gap-3 items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition ${
                      checked ? "bg-[#FFDA00]/15" : "hover:bg-gray-50"
                    }`}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleUsuario(u.usuarioId)}
                        color="amber"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {u.nombre}
                      </p>
                    </div>

                    <div className="md:block">
                      <p className="text-sm text-gray-600 break-all">
                        {u.correo}
                      </p>
                    </div>

                    <div>
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
                        {u.accessFailedCount} intentos
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Bloqueado hasta
                      </p>
                      <p className="text-sm text-gray-700">
                        {formatFecha(u.lockoutEnd)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
}