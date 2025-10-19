import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Tooltip,
  Switch,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon, PencilSquareIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE ?? "";
const URL = {
  cursos: `${API}/api/cursos`,
  cursoById: (id) => `${API}/api/cursos/${id}`,
  carreras: `${API}/api/carreras`,
  grados: `${API}/api/grados`,
};

const EstadoChip = ({ value }) => {
  const activo = Boolean(value);
  const color = activo ? "bg-green-600" : "bg-red-600";
  const text = activo ? "ACTIVO" : "INACTIVO";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${color}`}
    >
      {text}
    </span>
  );
};


export default function CatalogoCursos() {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros/paginación
  const [q, setQ] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // modal & form
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    carreraId: "",
    gradoId: "",
    esNetcad: false,
    estado: true,
  });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ===================== FETCH ===================== */
  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const [cursosRes, carrerasRes, gradosRes] = await Promise.all([
        fetch(URL.cursos),
        fetch(URL.carreras),
        fetch(URL.grados),
      ]);

      if (!cursosRes.ok || !carrerasRes.ok || !gradosRes.ok)
        throw new Error("Error al obtener catálogos");

      const cursosData = await cursosRes.json();
      const carrerasData = await carrerasRes.json();
      const gradosData = await gradosRes.json();

      // Crear mapas (diccionarios) de referencia por ID
      const carrerasMap = {};
      const gradosMap = {};

      carrerasData.forEach((c) => {
        carrerasMap[c.carreraId] = c.nombre;
      });
      gradosData.forEach((g) => {
        gradosMap[g.gradoId] = g.nombre;
      });

      // Orden descendente y mapeo de nombres
      const sortedCursos = [...cursosData]
        .sort((a, b) => Number(b.cursoId) - Number(a.cursoId))
        .map((c) => ({
          ...c,
          carreraNombre: carrerasMap[c.carreraId] ?? "—",
          gradoNombre: gradosMap[c.gradoId] ?? "—",
        }));

      setCursos(sortedCursos);
      setCarreras(carrerasData);
      setGrados(gradosData);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ===================== GUARDAR ===================== */
  const handleSave = async () => {
    if (
      !formData.nombre ||
      !formData.codigo ||
      !formData.carreraId ||
      !formData.gradoId
    ) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? URL.cursoById(editId) : URL.cursos;

    try {
      const body = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        carreraId: Number(formData.carreraId),
        gradoId: Number(formData.gradoId),
        esNetcad: Boolean(formData.esNetcad),
        estado: Boolean(formData.estado),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al guardar curso");
      await fetchData();
      setOpen(false);
      setFormData({
        codigo: "",
        nombre: "",
        carreraId: "",
        gradoId: "",
        esNetcad: false,
        estado: true,
      });
      setEditId(null);
    } catch (e) {
      console.error(e);
      alert("Error al guardar curso.");
    } finally {
      setSaving(false);
    }
  };

  /* ===================== FILTROS + PAGINACIÓN ===================== */
  const filtered = useMemo(() => {
    if (!q) return cursos;
    const qq = q.toLowerCase();
    return cursos.filter((c) =>
      `${c.nombre} ${c.codigo} ${c.carreraNombre} ${c.gradoNombre}`
        .toLowerCase()
        .includes(qq)
    );
  }, [cursos, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const clearFilters = () => {
    setQ("");
    setRowsPerPage(10);
    setPage(1);
  };

  /* ===================== UI ===================== */
  return (
    <div className="p-2 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Catálogo de Cursos
          </Typography>
          <Typography className="text-blue-gray-600">Vista general</Typography>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="h-5 w-5" /> Nuevo Curso
          </Button>

          <Button
            variant="outlined"
            className="flex items-center gap-2 border-[#2B338C] text-[#2B338C] hover:bg-[#FFFFFF]/20 transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Regresar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-2 overflow-visible relative z-50">
        <div className="relative flex items-center gap-2 flex-nowrap overflow-visible py-1 px-1">
          <div className="min-w-[240px]">
            <Input
              size="sm"
              crossOrigin=""
              label="Buscar…"
              icon={<MagnifyingGlassIcon className="h-4 w-4" />}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="min-w-[120px]">
            <Select
              size="sm"
              label="Filas"
              value={String(rowsPerPage)}
              onChange={(v) => {
                setRowsPerPage(Number(v || 10));
                setPage(1);
              }}
            >
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
            </Select>
          </div>

          <div className="ml-auto">
            <Button
              size="sm"
              variant="outlined"
              className="border-[#2B338C] text-[#2B338C]"
              onClick={clearFilters}
            >
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      {/* Resumen */}
      <div className="flex flex-wrap gap-2 text-xs font-bold text-white">
        <span className="inline-flex items-center rounded-full px-3 py-1 bg-[#2B338C]">
          TOTAL: {filtered.length}
        </span>

        <span className="inline-flex items-center rounded-full px-3 py-1 bg-green-600">
          ACTIVOS: {filtered.filter(c => c.estado === true).length}
        </span>

        <span className="inline-flex items-center rounded-full px-3 py-1 bg-red-600">
          INACTIVOS: {filtered.filter(c => c.estado === false).length}
        </span>

        <span className="inline-flex items-center rounded-full px-3 py-1 bg-amber-600">
          NETCAD: {filtered.filter(c => c.esNetcad === true).length}
        </span>

        <span className="inline-flex items-center rounded-full px-3 py-1 bg-gray-600">
          NORMALES: {filtered.filter(c => c.esNetcad === false).length}
        </span>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden relative z-0">
        <div className="overflow-x-auto">
          <table className="min-w-[950px] w-full text-left">
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                <th className="p-3 text-sm font-semibold">ID</th>
                <th className="p-3 text-sm font-semibold">Código</th>
                <th className="p-3 text-sm font-semibold">Nombre</th>
                <th className="p-3 text-sm font-semibold">Carrera</th>
                <th className="p-3 text-sm font-semibold">Grado</th>
                <th className="p-3 text-sm font-semibold">NetCad</th>
                <th className="p-3 text-sm font-semibold">Estado</th>
                <th className="p-3 text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-blue-gray-500">
                    Cargando…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-red-600">
                    {err}
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-blue-gray-500">
                    Sin registros.
                  </td>
                </tr>
              ) : (
                pageData.map((c) => (
                  <tr key={c.cursoId} className="border-b">
                    <td className="p-3">{c.cursoId}</td>
                    <td className="p-3">{c.codigo}</td>
                    <td className="p-3">{c.nombre}</td>
                    <td className="p-3">{c.carreraNombre ?? "—"}</td>
                    <td className="p-3">{c.gradoNombre ?? "—"}</td>
                    <td className="p-3">
                      {c.esNetcad ? "Sí" : "No"}
                    </td>
                    <td className="p-3">
                      <EstadoChip value={c.estado} />
                    </td>
                    <td className="p-3">
                      <Tooltip content="Editar curso">
                        <Button
                          size="sm"
                          className="bg-[#FFDA00] text-[#2B338C] p-2"
                          onClick={() => {
                            setEditId(c.cursoId);
                            setFormData({
                              codigo: c.codigo,
                              nombre: c.nombre,
                              carreraId: c.carreraId,
                              gradoId: c.gradoId,
                              esNetcad: c.esNetcad,
                              estado: c.estado,
                            });
                            setOpen(true);
                          }}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Button>
                      </Tooltip>
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
              {total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–
              {Math.min(page * rowsPerPage, total)}
            </b>{" "}
            de <b>{total}</b>
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

      {/* Modal */}
      <Dialog open={open} handler={() => setOpen(false)} size="md">
        <DialogHeader className="text-[#2B338C] font-bold">
          {editId ? "Editar Curso" : "Registrar Nuevo Curso"}
        </DialogHeader>
        <DialogBody className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Código del curso"
            value={formData.codigo}
            onChange={(e) =>
              setFormData({ ...formData, codigo: e.target.value })
            }
          />
          <Input
            label="Nombre del curso"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />

          <Select
            label="Carrera"
            value={String(formData.carreraId || "")}
            onChange={(v) => setFormData({ ...formData, carreraId: Number(v) })}
            selected={() => {
              const selectedCarrera = carreras.find(
                (c) => String(c.carreraId) === String(formData.carreraId)
              );
              return selectedCarrera ? selectedCarrera.nombre : "";
            }}
          >
            {carreras.map((c) => (
              <Option key={c.carreraId} value={c.carreraId}>
                {c.nombre}
              </Option>
            ))}
          </Select>

          <Select
            label="Grado"
            value={String(formData.gradoId || "")}
            onChange={(v) => setFormData({ ...formData, gradoId: Number(v) })}
            selected={() => {
              const selectedGrado = grados.find(
                (g) => String(g.gradoId) === String(formData.gradoId)
              );
              return selectedGrado ? selectedGrado.nombre : "";
            }}
          >
            {grados.map((g) => (
              <Option key={g.gradoId} value={g.gradoId}>
                {g.nombre}
              </Option>
            ))}
          </Select>

          <div className="flex items-center gap-3 md:col-span-2">
            <Typography className="text-blue-gray-700 font-medium">
              ¿Es curso NetCad?
            </Typography>
            <Switch
              checked={!!formData.esNetcad}
              onChange={(e) =>
                setFormData({ ...formData, esNetcad: !!e.target.checked })
              }
              label={formData.esNetcad ? "Sí" : "No"}
              ripple={false}
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <Typography className="text-blue-gray-700 font-medium">
              Estado del curso
            </Typography>
            <Switch
              checked={!!formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: !!e.target.checked })
              }
              label={formData.estado ? "Activo" : "Inactivo"}
              ripple={false}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outlined"
            color="gray"
            onClick={() => setOpen(false)}
            className="mr-2"
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#FFDA00] text-[#2B338C]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
