// components/ui/pagination/AppPagination.jsx
import { Button } from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function AppPagination({
  page,
  setPage,
  rowsPerPage,
  total,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (rowsPerPage || 1)));

  const start = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, total);

  const prev = () => setPage((p) => Math.max(1, p - 1));
  const next = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between gap-3 p-3 ${className}`}
    >
      <span className="text-md text-blue-gray-600">
        Mostrando <b>{start}–{end}</b> de <b>{total}</b>
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="outlined"
          size="md"
          className="border-[#2B338C] text-[#2B338C] px-3"
          disabled={page === 1}
          onClick={prev}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <span className="px-2 text-md">
          Página <b>{page}</b> de <b>{totalPages}</b>
        </span>

        <Button
          variant="outlined"
          size="md"
          className="border-[#2B338C] text-[#2B338C] px-3"
          disabled={page >= totalPages}
          onClick={next}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
