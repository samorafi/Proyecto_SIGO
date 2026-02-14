import { useState, useEffect } from "react";
import { Card, Input, Button, Typography, Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip, Checkbox, Select, Option, } from "@material-tailwind/react";
import { PlusIcon, PencilSquareIcon, ShieldCheckIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon, } from "@heroicons/react/24/outline";

export default function AdmRolesPermisos() {
    //***************************************************************************
    // ESTADOS GENERALES
    //***************************************************************************
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modales
    const [openModal, setOpenModal] = useState(false); // crear rol
    const [openEditModal, setOpenEditModal] = useState(false); // editar rol
    const [openPermisosModal, setOpenPermisosModal] = useState(false); // asignar permisos

    // Modal: Confirmar eliminación con usuarios afectados
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteRol, setDeleteRol] = useState(null); // { rolId, nombre }
    const [deleteUsuarios, setDeleteUsuarios] = useState([]); // [{ usuarioId, nombre, correo }]
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Formularios
    const [formRol, setFormRol] = useState({ nombre: "" });
    const [editRol, setEditRol] = useState(null);

    // Permisos
    const [permisos, setPermisos] = useState([]);
    const [selectedPermisos, setSelectedPermisos] = useState([]);

    //***************************************************************************
    // FETCH ROLES
    //***************************************************************************
    const fetchRoles = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/Roles");
            if (!response.ok) throw new Error("Error al obtener los roles");
            const data = await response.json();
            setRoles(data);
            setFilteredRoles(data);
        } catch (err) {
            setError(err.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Filtrado dinámico
    useEffect(() => {
        const timer = setTimeout(() => {
            const result = roles.filter((r) =>
                (r.nombre ?? "").toLowerCase().includes(search.toLowerCase())
            );
            setFilteredRoles(result);
        }, 400);
        return () => clearTimeout(timer);
    }, [search, roles]);

    //***************************************************************************
    // PAGINACIÓN
    //***************************************************************************
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const total = filteredRoles.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    const pageData = filteredRoles.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page, rowsPerPage, total]);

    //***************************************************************************
    // CREAR ROL
    //***************************************************************************
    const handleSubmitRol = async (e) => {
        e?.preventDefault?.();

        if (!formRol.nombre.trim()) {
            alert("El nombre del rol es obligatorio");
            return;
        }

        try {
            const response = await fetch("/api/Roles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formRol),
            });
            if (!response.ok) throw new Error("Error al crear rol");

            alert("Rol creado con éxito");
            setFormRol({ nombre: "" });
            setOpenModal(false);
            fetchRoles();
        } catch (err) {
            alert("Error: " + (err.message || "Error inesperado"));
        }
    };

    //***************************************************************************
    // EDITAR ROL
    //***************************************************************************
    const handleOpenEdit = (rol) => {
        setEditRol({ rolId: rol.rolId, nombre: rol.nombre });
        setOpenEditModal(true);
    };

    const handleUpdateRol = async (e) => {
        e?.preventDefault?.();
        if (!editRol) return;

        try {
            const response = await fetch(`/api/Roles/${editRol.rolId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editRol),
            });
            if (!response.ok) throw new Error("Error al actualizar rol");

            alert("Rol actualizado con éxito");
            setOpenEditModal(false);
            setEditRol(null);
            fetchRoles();
        } catch (err) {
            alert("Error: " + (err.message || "Error inesperado"));
        }
    };

    //***************************************************************************
    // ASIGNAR PERMISOS
    //***************************************************************************
    const handleOpenPermisos = async (rol) => {
        try {
            // Traer lista de permisos disponibles
            const permisosResp = await fetch("/api/Permisos");
            if (!permisosResp.ok) throw new Error("Error al obtener permisos");
            const permisosData = await permisosResp.json();
            setPermisos(permisosData);

            // Traer permisos ya asignados al rol
            const rolPermisosResp = await fetch(`/api/Roles/${rol.rolId}`);
            if (!rolPermisosResp.ok) throw new Error("Error al obtener permisos del rol");
            const rolPermisosData = await rolPermisosResp.json();

            // Precargar los IDs de los permisos asignados
            const ids = (rolPermisosData.permisos ?? []).map((p) => p.permisoId);
            setSelectedPermisos(ids);

            setEditRol(rol);
            setOpenPermisosModal(true);
        } catch (err) {
            alert("Error cargando permisos: " + (err.message || "Error inesperado"));
        }
    };

    const handleSavePermisos = async () => {
        if (!editRol) return;

        try {
            const resp = await fetch(`/api/Roles/${editRol.rolId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rolId: editRol.rolId,
                    nombre: editRol.nombre,
                    permisosIds: selectedPermisos,
                }),
            });

            if (!resp.ok) throw new Error("Error al asignar permisos");

            alert("Permisos actualizados con éxito");
            setOpenPermisosModal(false);
            setEditRol(null);
            fetchRoles();
        } catch (err) {
            alert("Error al asignar permisos: " + (err.message || "Error inesperado"));
        }
    };

    //***************************************************************************
    // ELIMINAR ROL (con advertencia de usuarios asignados)
    //***************************************************************************
    const handleOpenDelete = async (rol) => {
        setDeleteRol({ rolId: rol.rolId, nombre: rol.nombre });
        setDeleteUsuarios([]);
        setOpenDeleteModal(true);
        setDeleteLoading(true);

        try {
            // Endpoint nuevo: GET /api/Roles/{id}/usuarios
            const resp = await fetch(`/api/Roles/${rol.rolId}/usuarios`);
            if (!resp.ok) {
                // Si el endpoint no existe aún, no bloqueamos: solo mostramos confirmación simple
                setDeleteUsuarios([]);
                return;
            }

            const data = await resp.json();
            setDeleteUsuarios(Array.isArray(data) ? data : []);
        } catch {
            setDeleteUsuarios([]);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteRol) return;

        try {
            const response = await fetch(`/api/Roles/${deleteRol.rolId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Error al eliminar rol");

            alert("Rol eliminado con éxito");
            setOpenDeleteModal(false);
            setDeleteRol(null);
            setDeleteUsuarios([]);
            fetchRoles();
        } catch (err) {
            alert("Error: " + (err.message || "Error inesperado"));
        }
    };

    //***************************************************************************
    // RENDER
    //***************************************************************************
    return (
        <div className="p-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between gap-3">
                <Typography className="text-2xl font-extrabold text-[#2B338C]">
                    Administrar Roles y Permisos
                </Typography>
                <Button
                    className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2"
                    onClick={() => setOpenModal(true)}
                >
                    <PlusIcon className="h-5 w-5" /> Registrar nuevo rol
                </Button>
            </div>

            {/* Modal: Crear rol */}
            <Dialog open={openModal} handler={() => setOpenModal(false)}>
                <DialogHeader className="text-[#2B338C]">Registrar nuevo rol</DialogHeader>
                <DialogBody divider>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmitRol}>
                        <Input
                            label="Nombre del Rol"
                            name="nombre"
                            value={formRol.nombre}
                            onChange={(e) => setFormRol({ ...formRol, nombre: e.target.value })}
                            required
                        />
                    </form>
                </DialogBody>
                <DialogFooter className="gap-3">
                    <Button className="bg-[#2B338C] text-white" onClick={() => setOpenModal(false)}>
                        Cancelar
                    </Button>
                    <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={handleSubmitRol}>
                        Guardar
                    </Button>
                </DialogFooter>
            </Dialog>

            <div className="my-6 border-b border-blue-gray-50" />

            {/* Filtros */}
            <Card className="p-3">
                <div className="grid grid-cols-1 md:flex items-end gap-4">
                    {/* Barra de búsqueda */}
                    <div className="md:flex-1" id="search-bar">
                        <Input
                            label="Buscar por nombre de rol"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Estado (placeholder — lo dejé igual que tu código) */}
                    <div className="min-w-[140px]">
                        <Select
                            label="Estado"
                            value={String(rowsPerPage)}
                            onChange={(v) => setRowsPerPage(Number(v))}
                        >
                            <Option value="1">Activo</Option>
                            <Option value="0">Inactivo</Option>
                        </Select>
                    </div>

                    {/* Filas por página */}
                    <div className="min-w-[140px]">
                        <Select
                            label="Filas por página"
                            value={String(rowsPerPage)}
                            onChange={(v) => setRowsPerPage(Number(v))}
                        >
                            <Option value="10">10</Option>
                            <Option value="20">20</Option>
                            <Option value="50">50</Option>
                        </Select>
                    </div>

                    {/* Limpiar filtros */}
                    <div className="min-w-[140px]">
                        <Button
                            variant="outlined"
                            className="w-full border-[#2B338C] text-[#2B338C]"
                            onClick={() => {
                                setSearch("");
                                setRowsPerPage(10);
                            }}
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="my-6 border-b border-blue-gray-50" />

            {/* Tabla */}
            {loading && <p>Cargando roles...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}

            {!loading && !error && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-[600px] w-full text-left">
                            <thead>
                                <tr className="bg-blue-gray-50 text-blue-gray-700">
                                    <th className="p-3 text-sm font-semibold">Rol</th>
                                    <th className="p-3 text-sm font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.map((r) => (
                                    <tr key={r.rolId} className="border-b">
                                        <td className="p-3">{r.nombre}</td>
                                        <td className="p-3 flex gap-2">
                                            <Tooltip content="Editar">
                                                <Button
                                                    size="sm"
                                                    className="bg-[#FFDA00] text-[#2B338C] p-2"
                                                    onClick={() => handleOpenEdit(r)}
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip content="Asignar Permisos">
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 text-white p-2"
                                                    onClick={() => handleOpenPermisos(r)}
                                                >
                                                    <ShieldCheckIcon className="h-4 w-4" />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip content="Eliminar">
                                                <Button
                                                    size="sm"
                                                    className="bg-red-600 text-white p-2"
                                                    onClick={() => handleOpenDelete(r)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="flex items-center justify-between p-3">
                        <span className="text-sm text-blue-gray-600">
                            Página {page} de {totalPages}
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="outlined"
                                size="sm"
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
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Modal: Editar rol */}
            <Dialog open={openEditModal} handler={() => setOpenEditModal(false)}>
                <DialogHeader className="text-[#2B338C]">Editar Rol</DialogHeader>
                <DialogBody divider>
                    {editRol ? (
                        <form className="flex flex-col gap-4" onSubmit={handleUpdateRol}>
                            <Input
                                label="Nombre del Rol"
                                value={editRol.nombre}
                                onChange={(e) => setEditRol({ ...editRol, nombre: e.target.value })}
                            />
                        </form>
                    ) : (
                        <Typography>Cargando datos del rol...</Typography>
                    )}
                </DialogBody>
                <DialogFooter className="gap-3">
                    <Button className="bg-[#2B338C] text-white" onClick={() => setOpenEditModal(false)}>
                        Cancelar
                    </Button>
                    <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={handleUpdateRol}>
                        Guardar
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Modal: Asignar permisos */}
            <Dialog open={openPermisosModal} handler={() => setOpenPermisosModal(false)}>
                <DialogHeader className="text-[#2B338C]">Asignar permisos</DialogHeader>
                <DialogBody divider>
                    {permisos.length > 0 ? (
                        permisos.map((p) => (
                            <Checkbox
                                key={p.permisoId}
                                label={p.nombre}
                                checked={selectedPermisos.includes(p.permisoId)}
                                onChange={() =>
                                    setSelectedPermisos((prev) =>
                                        prev.includes(p.permisoId)
                                            ? prev.filter((id) => id !== p.permisoId)
                                            : [...prev, p.permisoId]
                                    )
                                }
                            />
                        ))
                    ) : (
                        <Typography>Cargando permisos...</Typography>
                    )}
                </DialogBody>
                <DialogFooter className="gap-3">
                    <Button className="bg-[#2B338C] text-white" onClick={() => setOpenPermisosModal(false)}>
                        Cancelar
                    </Button>
                    <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={handleSavePermisos}>
                        Guardar
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Modal: Confirmar eliminación (con usuarios asignados) */}
            <Dialog open={openDeleteModal} handler={() => setOpenDeleteModal(false)} size="md">
                <DialogHeader className="text-[#2B338C]">Confirmar eliminación</DialogHeader>
                <DialogBody divider>
                    <Typography className="text-sm text-blue-gray-700">
                        ¿Seguro que deseas eliminar el rol{" "}
                        <b>{deleteRol?.nombre ?? ""}</b>?
                    </Typography>

                    <div className="mt-3">
                        {deleteLoading ? (
                            <Typography className="text-sm">Cargando usuarios asignados...</Typography>
                        ) : deleteUsuarios.length === 0 ? (
                            <Typography className="text-sm text-blue-gray-600">
                                No se encontraron usuarios con este rol (o el endpoint aún no está disponible).
                            </Typography>
                        ) : (
                            <>
                                <Typography className="text-sm font-semibold text-red-600">
                                    Este rol está asignado a {deleteUsuarios.length} usuario(s).
                                </Typography>
                                <Typography className="text-sm text-blue-gray-700 mt-1">
                                    Si continuas, el rol se eliminará y quedará desasignado para todos ellos.
                                </Typography>

                                <div className="mt-3 max-h-56 overflow-auto border rounded-lg">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-blue-gray-50">
                                            <tr>
                                                <th className="p-2 font-semibold">Nombre</th>
                                                <th className="p-2 font-semibold">Correo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deleteUsuarios.map((u) => (
                                                <tr key={u.usuarioId} className="border-t">
                                                    <td className="p-2">{u.nombre}</td>
                                                    <td className="p-2">{u.correo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </DialogBody>
                <DialogFooter className="gap-3">
                    <Button
                        className="bg-[#2B338C] text-white"
                        onClick={() => {
                            setOpenDeleteModal(false);
                            setDeleteRol(null);
                            setDeleteUsuarios([]);
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        className="bg-red-600 text-white"
                        disabled={deleteLoading || !deleteRol}
                        onClick={handleConfirmDelete}
                    >
                        Eliminar rol
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
