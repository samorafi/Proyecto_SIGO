import { useState, useEffect } from "react";
import {
  Card, Input, Button, Typography,
  Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip,
} from "@material-tailwind/react";
import {
  PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, KeyIcon
} from "@heroicons/react/24/outline";

export default function AdmUsuarios() {
  //******************************************************************************* */
  // ENDPOINT 1:
  //******************************************************************************* */

  // Método: Modal para registrar un nuevo usuario
  const [openModal, setOpenModal] = useState(false);

  // Método: Manejo de datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: ""
  });

  // Metodo: Abrir/Cerrar modal
  const handleOpen = () => setOpenModal(!openModal);

  // Método: Manejo de datos en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // EndPoint: Creación de un nuevo usuario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      // Validación básica antes del fetch - Evitar envios en blanco
      if (!formData.nombre.trim() || !formData.correo.trim() || !formData.contrasena.trim()) {
        alert("Todos los campos son obligatorios");
        return;
      }

      // Fetch al EndPoint
      const response = await fetch("/api/Usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // parseamos la respuesta

      // Validamos duplicado
      if (data.id === -1) {
        alert(data.message);
        setOpenModal(false);
        return;
      }

      // Validamos errores HTTP
      if (!response.ok) {
        alert("Error al crear usuario: " + (data.message || "Error desconocido"));
        return;
      }

      // Éxito
      alert(data.message);
      setFormData({ nombre: "", correo: "", contrasena: "" });
      setOpenModal(false);

    } catch (err) {
      alert("Error de conexión con el servidor: " + err.message);
    }
  };


  //******************************************************************************* */
  // ENDPOINT 2:
  //******************************************************************************* */

  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal de edición
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("/api/Usuarios");
      if (!response.ok) throw new Error("Error al obtener los usuarios");

      const data = await response.json();
      setUsuarios(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Filtrado dinámico
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(search.toLowerCase()) ||
          u.correo.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(result);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, usuarios]);

  // Paginación
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const pageData = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Abrir modal de edición
  const handleOpenEdit = (user) => {
  setEditUser({
    usuarioId: user.usuarioId,
    nombre: user.nombre,
    correo: user.correo,
    contrasena: "*****",       // lo que ve el usuario
    _realContrasena: user.contrasena, 
    activo: user.activo,
  });
  setOpenEditModal(true);
};


  // Guardar cambios de edición
const handleUpdate = async (e) => {
  e.preventDefault();

  if (!editUser) return;

  //Siempre enviamos contraseña
  const payload = {
    UsuarioId: editUser.usuarioId,
    Nombre: editUser.nombre,
    Correo: editUser.correo,
    Contrasena: editUser.contrasena === "*****"
      ? editUser._realContrasena   // usamos la real si no fue modificada
      : editUser.contrasena,       // usamos la nueva si fue cambiada
    Activo: editUser.activo,
  };

  try {
    const response = await fetch(`/api/Usuarios/${editUser.usuarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      alert("Error al actualizar: " + (data?.message || "Error desconocido"));
      return;
    }

    alert(data?.Message || "Usuario actualizado con éxito");
    setOpenEditModal(false);
    setEditUser(null);
    fetchUsuarios();
  } catch (err) {
    alert("Error de conexión: " + err.message);
  }
};


  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <Typography className="text-2xl font-extrabold text-[#2B338C]">
          Administrar Usuarios
        </Typography>

        <Button
          className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2"
          onClick={handleOpen}
        >
          <PlusIcon className="h-5 w-5" /> Registrar nuevo usuario
        </Button>
      </div>

      {/* Modal: Crear usuario */}
      <Dialog open={openModal} handler={handleOpen}>
        <DialogHeader className="text-[#2B338C]">Registrar nuevo usuario</DialogHeader>

        <DialogBody divider>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input label="Nombre Completo" name="nombre" value={formData.nombre} onChange={handleChange} required />
            <Input label="Correo" type="email" name="correo" value={formData.correo} onChange={handleChange} required />
            <Input label="Contraseña" type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
          </form>
        </DialogBody>

        <DialogFooter className="gap-3">
          <Button className="bg-[#2B338C] text-white" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={handleSubmit}>
            Guardar
          </Button>
        </DialogFooter>
      </Dialog>

      <div className="my-6 border-b border-blue-gray-50" />

      <h3 className="text-lg font-semibold text-[#2B338C] mb-4">Lista de Usuarios</h3>

      {/* Input búsqueda */}
      <div className="mb-4">
        <Input label="Buscar por nombre o correo" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Estados */}
      {loading && <p className="text-blue-gray-600">Cargando usuarios...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <>
          <p className="text-sm text-blue-gray-600">Total de usuarios: {total}</p>

          {/* Tabla */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-left">
                <thead>
                  <tr className="bg-blue-gray-50 text-blue-gray-700">
                    <th className="p-3 text-sm font-semibold">Nombre</th>
                    <th className="p-3 text-sm font-semibold">Correo</th>
                    <th className="p-3 text-sm font-semibold">Estado</th>
                    <th className="p-3 text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-blue-gray-500">
                        Sin registros.
                      </td>
                    </tr>
                  ) : (
                    pageData.map((u) => (
                      <tr key={u.usuarioId} className="border-b">
                        <td className="p-3">{u.nombre}</td>
                        <td className="p-3">{u.correo}</td>
                        <td className="p-3">{u.activo ? "Activo" : "Inactivo"}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Tooltip content="Editar">
                              <Button
                                size="sm"
                                className="bg-[#FFDA00] text-[#2B338C] p-2"
                                onClick={() => handleOpenEdit(u)}
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Asignar Rol">
                              <Button
                                size="sm"
                                className="bg-blue-600 text-white p-2"
                                onClick={() => handleOpenEdit(u)}
                              >
                                <KeyIcon className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3">
              <span className="text-sm text-blue-gray-600">
                Mostrando <b>{pageData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredUsers.length)}</b>{" "}
                de <b>{filteredUsers.length}</b>
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outlined"
                  size="sm"
                  className="border-[#2B338C] text-[#2B338C] px-3"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <span className="px-2 text-sm">
                  Página <b>{page}</b> de <b>{totalPages}</b>
                </span>
                <Button
                  variant="outlined"
                  size="sm"
                  className="border-[#2B338C] text-[#2B338C] px-3"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Modal: Editar usuario */}
      <Dialog open={openEditModal} handler={() => setOpenEditModal(false)}>
        <DialogHeader className="text-[#2B338C]">Editar usuario</DialogHeader>

        <DialogBody divider>
          {editUser ? (
            <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
              <Input
                label="Nombre Completo"
                name="nombre"
                value={editUser.nombre}
                onChange={(e) => setEditUser({ ...editUser, nombre: e.target.value })}
                required
              />
              <Input
                label="Correo"
                type="email"
                name="correo"
                value={editUser.correo}
                onChange={(e) => setEditUser({ ...editUser, correo: e.target.value })}
                required
              />
              <Input
                label="Contraseña"
                type="password"
                name="contrasena"
                value={editUser.contrasena}
                onChange={(e) => setEditUser({ ...editUser, contrasena: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-blue-gray-700 mb-1">Estado</label>
                <select
                  className="border rounded-md w-full p-2"
                  value={editUser.activo ? "1" : "0"}
                  onChange={(e) => setEditUser({ ...editUser, activo: e.target.value === "1" })}
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
            </form>
          ) : (
            <p className="text-blue-gray-500">Cargando...</p>
          )}
        </DialogBody>

        <DialogFooter className="gap-3">
          <Button className="bg-[#2B338C] text-white" onClick={() => setOpenEditModal(false)}>
            Cancelar
          </Button>
          <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={handleUpdate}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}