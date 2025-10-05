import { useState, useEffect } from "react";
import {
    Card, Input, Button, Typography,
    Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip,
    Checkbox, Select, Option
} from "@material-tailwind/react";
import {
    PlusIcon, PencilSquareIcon, ShieldCheckIcon,
    ChevronLeftIcon, ChevronRightIcon, TrashIcon
} from "@heroicons/react/24/outline";


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
        try {
            const response = await fetch("/api/Roles");
            if (!response.ok) throw new Error("Error al obtener los roles");
            const data = await response.json();
            setRoles(data);
            setFilteredRoles(data);
        } catch (err) {
            setError(err.message);
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
            const result = roles.filter(
                (r) => r.nombre.toLowerCase().includes(search.toLowerCase())
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
    const total = filteredRoles.length;;
    const pageData = filteredRoles.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page, rowsPerPage, total]);


    //***************************************************************************
    // CREAR ROL
    //***************************************************************************
    const handleSubmitRol = async (e) => {
        e.preventDefault();
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
            alert("Error: " + err.message);
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
        e.preventDefault();
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
            alert("Error: " + err.message);
        }
    };

    //***************************************************************************
    // ASIGNAR PERMISOS
    //***************************************************************************
    const handleOpenPermisos = async (rol) => {
        try {
            // Traer lista de permisos disponibles
            const permisosResp = await fetch("/api/Permisos");
            const permisosData = await permisosResp.json();
            setPermisos(permisosData);

            // Traer permisos ya asignados al rol
            const rolPermisosResp = await fetch(`/api/Roles/${rol.rolId}`);
            const rolPermisosData = await rolPermisosResp.json();

            // Precargar los IDs de los permisos asignados
            setSelectedPermisos(rolPermisosData.permisos.map((p) => p.permisoId));

            setEditRol(rol);
            setOpenPermisosModal(true);
        } catch (err) {
            alert("Error cargando permisos: " + err.message);
        }
    };

    const handleSavePermisos = async () => {
        try {
            await fetch(`/api/Roles/${editRol.rolId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rolId: editRol.rolId,
                    nombre: editRol.nombre,
                    permisosIds: selectedPermisos,
                }),
            });
            alert("Permisos actualizados con éxito");
            setOpenPermisosModal(false);
            setEditRol(null);
            fetchRoles();
        } catch (err) {
            alert("Error al asignar permisos: " + err.message);
        }
    };

    //***************************************************************************
    // ELIMINAR ROL
    //***************************************************************************
    const handleDeleteRol = async (rolId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este rol?")) return;

        try {
            const response = await fetch(`/api/Roles/${rolId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Error al eliminar rol");
            alert("Rol eliminado con éxito");
            fetchRoles(); // refresca lista
        } catch (err) {
            alert("Error: " + err.message);
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

                {/* Contenedor Principal de Controles */}
                <div className="grid grid-cols-1 md:flex items-end gap-4">

                    {/* 1. Barra de búsqueda */}
                    <div className="md:flex-1" id="search-bar">
                        <Input
                            label="Buscar por nombre de rol"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                     {/* 2. Filtro por activo o inactivo */}
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

                    {/* 2. Filas por página (Ancho fijo) */}
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

                    {/* 3. Botón de limpiar filtros (Ancho fijo) */}
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
                                    <th className="p-3 text-sm font-semibold">Id</th>
                                    <th className="p-3 text-sm font-semibold">Rol</th>
                                    <th className="p-3 text-sm font-semibold">Estado</th>
                                    <th className="p-3 text-sm font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.map((r) => (
                                    <tr key={r.rolId} className="border-b">
                                        <td className="p-3">{r.rolId}</td>
                                        <td className="p-3">{r.nombre}</td>
                                        <td className="p-3">PENDIENTE</td>
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
                                                    onClick={() => handleDeleteRol(r.rolId)}
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
                <DialogFooter>
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
                <DialogFooter>

                    <Button
                        className="bg-[#2B338C] text-white"
                        onClick={() => setOpenPermisosModal(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="bg-[#FFDA00] text-[#2B338C]"
                        onClick={handleSavePermisos}
                    >
                        Guardar
                    </Button>
                </DialogFooter>
            </Dialog>

        </div>
    );
}
