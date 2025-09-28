import { useState, useEffect } from "react";
import {
  Card, Input, Button, Typography,
  Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip,
} from "@material-tailwind/react";
import {
  PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon
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

  // DATOS TEMPORALES
  const [usuarios, setUsuarios] = useState([
    { usuarioId: 1, nombre: "Harlyn Luna", correo: "harlyn@example.com", activo: true },
    { usuarioId: 2, nombre: "Ana Pérez", correo: "ana@example.com", activo: false },
    { usuarioId: 3, nombre: "Carlos Mora", correo: "carlos@example.com", activo: true },
  ]);

  // Búsqueda y filtrado
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(usuarios);

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


  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        {/* Título de la sección */}
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">Administrar Usuarios</Typography>
        </div>

        {/* Botón para registrar nuevo usuario */}
        <div className="flex items-center gap-2">
          <Button
            className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2"
            onClick={handleOpen}
          >
            <PlusIcon className="h-5 w-5" /> Registrar nuevo usuario
          </Button>
        </div>
      </div>

      {/* Modal: Registro de un nuevo usuario */}
      <Dialog open={openModal} handler={handleOpen}>
        { /* Título del modal */}
        <DialogHeader className="text-[#2B338C]">Registrar nuevo usuario</DialogHeader>

        { /* Cuerpo del modal: Formulario */}
        <DialogBody divider>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            {/* Campo 1: Nombre completo */}
            <Input
              className="!border-t-[#2B338C] focus:!border-t-[#FFFFFF]"
              label="Nombre Completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

            {/* Campo 2: Correo */}
            <Input
              className="!border-t-[#2B338C] focus:!border-t-[#FFFFFF]"
              label="Correo"
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />

            {/* Campo 3: Contraseña */}
            <Input
              className="!border-t-[#2B338C] focus:!border-t-[#FFFFFF]"
              label="Contraseña"
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
          </form>
        </DialogBody>

        { /* Footer del modal:Botones de acción */}
        <DialogFooter className="gap-3">

          {/* Botón de cancelar */}
          <Button
            className="bg-[#2B338C] text-[#FFFFFF]"
            onClick={handleOpen}
          >
            Cancelar
          </Button>

          {/* Botón de guardar */}
          <Button
            className="bg-[#FFDA00] text-[#2B338C]"
            onClick={handleSubmit}
          >
            Guardar
          </Button>
        </DialogFooter>
      </Dialog>

      <div className="my-6 border-b border-blue-gray-50" />

      <h3 className="text-lg font-semibold text-[#2B338C] mb-4">Lista de Usuarios</h3>

      {/* Input de búsqueda */}
      <div className="mb-4">
        <Input
          label="Buscar por nombre o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <p className="text-sm text-blue-gray-600">Total de usuarios: {total}</p>

      {/* Tabla de usuarios */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full text-left">

            {/* Encabezado de la tabla */}
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                <th className="p-3 text-sm font-semibold">Nombre</th>
                <th className="p-3 text-sm font-semibold">Correo</th>
                <th className="p-3 text-sm font-semibold">Activo</th>
                <th className="p-3 text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>

              {/* Filtrado de usuarios */}
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-blue-gray-500">
                    Sin registros.
                  </td>
                </tr>
              ) : (
                filteredUsers
                  .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                  .map((u) => (

                    // Fila de registro del usuario.
                    <tr key={u.usuarioId} className="border-b">
                      <td className="p-3">{u.nombre}</td>
                      <td className="p-3">{u.correo}</td>
                      <td className="p-3">{u.activo ? "Sí" : "No"}</td>
                     
                     
                      <td className="p-3">
                        <div className="flex items-center gap-2">

                          {/* Acciones: Botón Editar Inactivar */}
                          <Tooltip content="Editar">
                            <Button size="sm" className="bg-[#FFDA00] text-[#2B338C] p-2">
                              <PencilSquareIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          
                          {/* Acciones: Botón Inactivar */}
                          <Tooltip content="Inactivar">
                            <Button size="sm" variant="outlined" className="border-red-500 text-red-600 p-2">
                              <TrashIcon className="h-4 w-4" />
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
            Mostrando{" "}
            <b>
              {filteredUsers.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredUsers.length)}
            </b>{" "}
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
              Página <b>{page}</b> de <b>{Math.ceil(filteredUsers.length / rowsPerPage)}</b>
            </span>
            <Button
              variant="outlined"
              size="sm"
              className="border-[#2B338C] text-[#2B338C] px-3"
              disabled={page >= Math.ceil(filteredUsers.length / rowsPerPage)}
              onClick={() => setPage((p) => Math.min(Math.ceil(filteredUsers.length / rowsPerPage), p + 1))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}