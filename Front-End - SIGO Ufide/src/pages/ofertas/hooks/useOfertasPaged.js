/*
  Nombre: useOfertasPaged

  Descripción:  Hook para manejar la lógica de enlistado de registros de oferta con manejo de 
                paginación, filtros y cacheo.

  Reglas de negocio:
  - El hook recibe la categoría de oferta a listar (Presencial/Virtual, En Línea, Histórico).
  - El hook recibe filtros de búsqueda (texto, sede, modalidad, periodo, acción, estado, día, horario).
  - El hook maneja la paginación (página actual, tamaño de página) y el total de registros.
  - El hook implementa un sistema de cacheo por categoría+filtros+página para mejorar rendimiento.
  - El cache se invalida automáticamente después de un tiempo configurable (ej. 1 minuto).
  - El hook expone una función de refresh que fuerza la recarga desde backend y actualiza cache.

  Clases relacionadas:
  - Backend:  - SIGO.Application.Features.Ofertas.Queries.GetAllOfertasQueryHandler
              - SIGO.Application.Features.Ofertas.Queries.GetAllOfertasQuery
  - Frontend:
              - Componente tabla: OfertasPagedTable.jsx (consume este hook para mostrar datos)
  */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/services/apiClientService";

// Tamaños de pagina permitidas
const ALLOWED_PAGE_SIZES = [10, 25, 50, 100];

// Cache global (vive mientras la app está abierta)
const ofertasPagedCache = new Map();

// { items, totalCount, totalPages, ts }
const CACHE_TTL_MS = 60_000; // 1 minuto (ajustable en caso de modificaciones)

// Construye una clave de cache única basada en categoría, página, tamaño y filtros 
function buildCacheKey({ category, page, pageSize, stableFilters }) {
  return JSON.stringify({ category, page, pageSize, ...stableFilters });
}

// Hook principal
export function useOfertasPaged({ category, initialPageSize = 10, filters = {} }) {

  // Estados de datos y UI
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  // El tamaño de página se valida contra los permitidos, si no es válido se setea a 10
  const [pageSize, setPageSize] = useState(
    ALLOWED_PAGE_SIZES.includes(initialPageSize) ? initialPageSize : 10
  );

  // Total de registros y páginas (para paginador)
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cancelar requests si el usuario cambia rápido o sale del módulo
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

  // La clave de cache se recalcula solo cuando cambia categoría, página, tamaño o filtros 
  const cacheKey = useMemo(
    () => buildCacheKey({ category, page, pageSize, stableFilters }),
    [category, page, pageSize, stableFilters]
  );


  const fetchPaged = useCallback(async ({ force = false } = {}) => {
    const cached = ofertasPagedCache.get(cacheKey);
    const isFresh = cached && (Date.now() - cached.ts) < CACHE_TTL_MS;

    // Si hay cache fresco y no se fuerza, se usa sin llamar al endpoint
    if (!force && isFresh) {
      setItems(cached.items);
      setTotalCount(cached.totalCount);
      setTotalPages(cached.totalPages);
      setError("");
      setLoading(false);
      return;
    }

    // Si hay cache pero viejo, se limpia y refresca
    if (!force && cached && !isFresh) {
      setItems(cached.items);
      setTotalCount(cached.totalCount);
      setTotalPages(cached.totalPages);
    }

    // Llamada al endpoint para datos frescos
    try {
      setLoading(true);
      setError("");

      // cancelá request anterior
      abortRef.current?.abort?.();
      const controller = new AbortController();
      abortRef.current = controller;

      // Construir query params desde categoría, página, tamaño y filtros 
      const params = new URLSearchParams({
        category: String(category),
        page: String(page),
        pageSize: String(pageSize),
      });

      // Filtros de búsqueda
      if (stableFilters.buscar) params.set("buscar", stableFilters.buscar);
      if (stableFilters.sedeId) params.set("sedeId", stableFilters.sedeId);
      if (stableFilters.modalidadId) params.set("modalidadId", stableFilters.modalidadId);
      if (stableFilters.periodoId) params.set("periodoId", stableFilters.periodoId);
      if (stableFilters.dia) params.set("dia", stableFilters.dia);
      if (stableFilters.horarioId) params.set("horarioId", stableFilters.horarioId);
      if (stableFilters.accionId) params.set("accionId", stableFilters.accionId);
      if (stableFilters.estadoOfertaId) params.set("estadoOfertaId", stableFilters.estadoOfertaId);

      // Llamada al endpoint
      const res = await apiFetch(`/api/Ofertas/paged?${params.toString()}`, {
        signal: controller.signal,
      });

      // Manejo de errores HTTP
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Validar estructura de datos esperada
      const next = {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        totalPages: data.totalPages ?? 0,
        ts: Date.now(),
      };

      // Guardar cache
      ofertasPagedCache.set(cacheKey, next);

      // Setear state
      setItems(next.items);
      setTotalCount(next.totalCount);
      setTotalPages(next.totalPages);

      // Manejo de errores
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

  // Cargar datos al montar y cuando cambian categoría, página, tamaño o filtros 
  useEffect(() => {
    fetchPaged();
    return () => abortRef.current?.abort?.();
  }, [fetchPaged]);

  // Determinar el tamaño de la pagina
  // Si el tamaño solicitado no está en los permitidos, se setea a 10 y se resetea a la página 1
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
    refresh: () => fetchPaged({ force: true }), 
    allowedPageSizes: ALLOWED_PAGE_SIZES,
  };
}
