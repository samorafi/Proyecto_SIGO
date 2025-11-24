import { useEffect, useMemo, useState } from "react";
import { Card, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Tooltip, Select, Option } from "@material-tailwind/react";
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PlusIcon, PencilSquareIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE ?? "";
const URL = {
  carreras: `${API}/api/carreras`,
  carreraById: (id) => `${API}/api/carreras/${id}`,
};

const MENU_CLS =
  "z-[2147483647] bg-white/100 border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto";
const CONT_CLS = "relative z-0";

export default function CatalogoCarreras() {
  const navigate = useNavigate();

  // data
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros/paginación
  const [q, setQ] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // modal - formulario
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: "" });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCarreras = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(URL.carreras);

      if (!res.ok) throw new Error(`GET ${URL.carreras} -> ${res.status}`);

      const json = await res.json();

      const arr = Array.isArray(json)
        ? json
        : (json.data ?? json.items ?? json.result ?? json.results ?? []);
      const safe = Array.isArray(arr) ? arr : [];

      const mapped = safe.map((c) => ({
        id: c.carreraId ?? c.id ?? c.ID,
        nombre: c.nombre ?? c.Nombre ?? "",
        __raw: c,
      }));

      const sortedCarreras = [...mapped].sort(
        (a, b) => Number(b.id) - Number(a.id)
      );

      setCarreras(sortedCarreras);

    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar las carreras.");
      setCarreras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarreras();
  }, []);

  const handleSave = async () => {
    if (!formData?.nombre?.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? URL.carreraById(editId) : URL.carreras;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: formData.nombre }),
      });
      if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}`);

      await fetchCarreras();
      setOpen(false);
      setFormData({ nombre: "" });
      setEditId(null);
    } catch (e) {
      console.error(e);
      alert("Error al guardar la carrera.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    if (!q) return carreras;
    const qq = String(q).toLowerCase();
    return carreras.filter((c) =>
      String(`${c.nombre} ${c.id}`).toLowerCase().includes(qq)
    );
  }, [carreras, q]);

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

      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Catálogo de Carreras
          </Typography>
          <Typography className="text-blue-gray-600">Vista general</Typography>
        </div>

        <div className="flex items-center gap-2">

          <Button
            className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="h-5 w-5" /> Nueva Carrera
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
              selected={() => String(rowsPerPage)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}
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
                <th className="p-3 text-sm font-semibold">Nombre</th>
                <th className="p-3 text-sm font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-blue-gray-500">
                    Cargando…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-red-600">
                    {err}
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-blue-gray-500">
                    Sin registros.
                  </td>
                </tr>
              ) : (
                pageData.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3">{c.nombre}</td>
                    <td className="p-3">
                      <Tooltip content="Editar carrera">
                        <span>
                          <Button
                            size="sm"
                            className="bg-[#FFDA00] text-[#2B338C] p-2"
                            onClick={() => {
                              setEditId(c.id);
                              setFormData({ nombre: c.nombre });
                              setOpen(true);
                            }}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                        </span>
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

      {/* Modal (crear/editar) */}
      <Dialog open={open} handler={() => setOpen(false)} size="sm">
        <DialogHeader className="text-[#2B338C] font-bold">
          {editId ? "Editar Carrera" : "Registrar Nueva Carrera"}
        </DialogHeader>

        <DialogBody className="space-y-4">
          <Input
            label="Nombre de la carrera"
            crossOrigin=""
            value={formData.nombre}
            onChange={(e) => setFormData({ nombre: e.target.value })}
          />
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button
            variant="outlined"
            color="gray"
            onClick={() => {
              setOpen(false);
              setFormData({ nombre: "" });
              setEditId(null);
            }}
          >
            Cancelar
          </Button>
          <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
