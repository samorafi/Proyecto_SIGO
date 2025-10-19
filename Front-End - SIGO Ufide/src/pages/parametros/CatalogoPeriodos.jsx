import { useEffect, useMemo, useState } from "react";
import { Card, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Select, Option, Tooltip} from "@material-tailwind/react";
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PlusIcon, PencilSquareIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export default function CatalogoPeriodos() {
  const navigate = useNavigate();
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros/paginación
  const [q, setQ] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // modal - formulario
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ numero: "", anio: "" });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPeriodos = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/periodos");
      if (!res.ok) throw new Error("Error al obtener periodos");
      const data = await res.json();

      const sorted = [...data].sort(
        (a, b) => Number(b.periodoId) - Number(a.periodoId)
      );
      setPeriodos(sorted);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los periodos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const handleSave = async () => {
    if (!formData.numero || !formData.anio) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/periodos/${editId}` : "/api/periodos";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Error al guardar periodo");

      await fetchPeriodos();
      setOpen(false);
      setFormData({ numero: "", anio: "" });
      setEditId(null);
    } catch (e) {
      console.error(e);
      alert("Error al guardar periodo.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    if (!q) return periodos;
    const qq = q.toLowerCase();
    return periodos.filter((p) =>
      `${p.numero} ${p.anio}`.toLowerCase().includes(qq)
    );
  }, [periodos, q]);

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

  return (
    <div className="p-2 md:p-6 space-y-4">

      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Catálogo de Periodos
          </Typography>
          <Typography className="text-blue-gray-600">Vista general</Typography>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="h-5 w-5" /> Nuevo Periodo
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
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden relative z-0">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-left">
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                <th className="p-3 text-sm font-semibold">ID</th>
                <th className="p-3 text-sm font-semibold">Número</th>
                <th className="p-3 text-sm font-semibold">Año</th>
                <th className="p-3 text-sm font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-blue-gray-500">
                    Cargando…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-red-600">
                    {err}
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-blue-gray-500">
                    Sin registros.
                  </td>
                </tr>
              ) : (
                pageData.map((p) => (
                  <tr key={p.periodoId} className="border-b">
                    <td className="p-3">{p.periodoId}</td>
                    <td className="p-3">
                      {p.numero}Q
                    </td>
                    <td className="p-3">{p.anio}</td>
                    <td className="p-3">
                      <Tooltip content="Editar periodo">
                        <Button
                          size="sm"
                          className="bg-[#FFDA00] text-[#2B338C] p-2"
                          onClick={() => {
                            setEditId(p.periodoId);
                            setFormData({ numero: p.numero, anio: p.anio });
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
            <b>{total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, total)}</b>{" "}
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
      <Dialog open={open} handler={() => setOpen(false)} size="sm">
        <DialogHeader className="text-[#2B338C] font-bold">
          {editId ? "Editar Periodo" : "Registrar Nuevo Periodo"}
        </DialogHeader>

        <DialogBody className="space-y-4">
          
          <Select
            label="Cuatrimestre"
            value={String(formData.numero)}
            onChange={(v) => setFormData({ ...formData, numero: Number(v) })}
          >
            <Option value="1">1Q</Option>
            <Option value="2">2Q</Option>
            <Option value="3">3Q</Option>
          </Select>

          {/* Select Año Académico */}
          <Select
            label="Año académico"
            value={String(formData.anio)}
            onChange={(v) => setFormData({ ...formData, anio: Number(v) })}
          >
            {Array.from({ length: 101 }, (_, i) => 2021 + i).map((year) => (
              <Option
                key={year}
                value={year}
                disabled={year < 2021} 
              >
                {year}
              </Option>
            ))}
          </Select>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outlined"
            color="gray"
            onClick={() => {
              setOpen(false);
              setFormData({ numero: "", anio: "" });
              setEditId(null);
            }}
            className="mr-2"
          >
            Cancelar
          </Button>

          <Button
            className="bg-[#FFDA00] text-[#2B338C]"
            onClick={() => {
              // Validación extra antes de guardar
              if (formData.anio < 2021) {
                alert("El año académico debe ser 2021 o mayor.");
                return;
              }
              handleSave();
            }}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
