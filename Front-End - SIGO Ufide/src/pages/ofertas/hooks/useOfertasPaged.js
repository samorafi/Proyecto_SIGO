import { useCallback, useEffect, useMemo, useState } from "react";

const ALLOWED_PAGE_SIZES = [10, 25, 50, 100];

export function useOfertasPaged({ category, initialPageSize = 10, filters = {} }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(
    ALLOWED_PAGE_SIZES.includes(initialPageSize) ? initialPageSize : 10
  );

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stableFilters = useMemo(() => ({
    buscar: (filters?.buscar ?? "").trim(),

    sedeId: filters?.sedeId ? String(filters.sedeId) : "",
    modalidadId: filters?.modalidadId ? String(filters.modalidadId) : "",
    periodoId: filters?.periodoId ? String(filters.periodoId) : "",
    accionId: filters?.accionId ? String(filters.accionId) : "",
    estadoOfertaId: filters?.estadoOfertaId ? String(filters.estadoOfertaId) : "",

    dia: (filters?.dia ?? "").trim(),
    horarioId: filters?.horarioId ? String(filters.horarioId) : "",
  }), [
    filters?.buscar,
    filters?.sedeId,
    filters?.modalidadId,
    filters?.periodoId,
    filters?.accionId,
    filters?.estadoOfertaId,
    filters?.dia,
    filters?.horarioId,
    filters?.accionId,
    filters?.estadoOfertaId,
  ]);

  const fetchPaged = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        category: String(category),
        page: String(page),
        pageSize: String(pageSize),
      });

      if (stableFilters.buscar) params.set("buscar", stableFilters.buscar);
      if (stableFilters.sedeId) params.set("sedeId", stableFilters.sedeId);
      if (stableFilters.modalidadId) params.set("modalidadId", stableFilters.modalidadId);
      if (stableFilters.periodoId) params.set("periodoId", stableFilters.periodoId);
      if (stableFilters.dia) params.set("dia", stableFilters.dia);
      if (stableFilters.horarioId) params.set("horarioId", stableFilters.horarioId);
      if (stableFilters.accionId) params.set("accionId", stableFilters.accionId);
      if (stableFilters.estadoOfertaId) params.set("estadoOfertaId", stableFilters.estadoOfertaId);

      const res = await fetch(`/api/Ofertas/paged?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setItems(data.items ?? []);
      setTotalCount(data.totalCount ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las ofertas.");
      setItems([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [category, page, pageSize, stableFilters]);

  useEffect(() => {
    fetchPaged();
  }, [fetchPaged]);

  const setSafePageSize = (next) => {
    const nextSize = ALLOWED_PAGE_SIZES.includes(next) ? next : 10;
    setPage(1);
    setPageSize(nextSize);
  };

  return {
    items,
    page,
    setPage,
    pageSize,
    setPageSize: setSafePageSize,
    totalCount,
    totalPages,
    loading,
    error,
    refresh: fetchPaged,
    allowedPageSizes: ALLOWED_PAGE_SIZES,
  };
}
