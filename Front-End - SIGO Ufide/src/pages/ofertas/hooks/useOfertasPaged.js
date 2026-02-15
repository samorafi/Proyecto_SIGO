import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ALLOWED_PAGE_SIZES = [10, 25, 50, 100];

// cache global (vive mientras la app está abierta)
const ofertasPagedCache = new Map();
// { items, totalCount, totalPages, ts }
const CACHE_TTL_MS = 60_000; // 1 minuto (ajustable)

function buildCacheKey({ category, page, pageSize, stableFilters }) {
  return JSON.stringify({ category, page, pageSize, ...stableFilters });
}

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

  // para cancelar requests si el usuario cambia rápido o sale del módulo
  const abortRef = useRef(null);

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
  ]);

  const cacheKey = useMemo(
    () => buildCacheKey({ category, page, pageSize, stableFilters }),
    [category, page, pageSize, stableFilters]
  );

  const fetchPaged = useCallback(async ({ force = false } = {}) => {
    const cached = ofertasPagedCache.get(cacheKey);
    const isFresh = cached && (Date.now() - cached.ts) < CACHE_TTL_MS;

    // 1) Si hay cache fresco y no forzás, pintá de una sin request
    if (!force && isFresh) {
      setItems(cached.items);
      setTotalCount(cached.totalCount);
      setTotalPages(cached.totalPages);
      setError("");
      setLoading(false);
      return;
    }

    // 2) Si hay cache pero viejo, podés pintar primero y refrescar (opcional)
    //    Esto evita “pantalla vacía” al volver.
    if (!force && cached && !isFresh) {
      setItems(cached.items);
      setTotalCount(cached.totalCount);
      setTotalPages(cached.totalPages);
    }

    try {
      setLoading(true);
      setError("");

      // cancelá request anterior
      abortRef.current?.abort?.();
      const controller = new AbortController();
      abortRef.current = controller;

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
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const next = {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        totalPages: data.totalPages ?? 0,
        ts: Date.now(),
      };

      // guardar cache
      ofertasPagedCache.set(cacheKey, next);

      // setear state
      setItems(next.items);
      setTotalCount(next.totalCount);
      setTotalPages(next.totalPages);

    } catch (e) {
      if (e?.name === "AbortError") return; // normal
      setError(e?.message || "No se pudieron cargar las ofertas.");
      setItems([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, category, page, pageSize, stableFilters]);

  useEffect(() => {
    fetchPaged();
    return () => abortRef.current?.abort?.();
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
    refresh: () => fetchPaged({ force: true }), // refresh fuerza backend
    allowedPageSizes: ALLOWED_PAGE_SIZES,
  };
}
