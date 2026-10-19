import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
  /** Página actual, empezando en 0. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

const getVisiblePages = (page: number, totalPages: number) => {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const halfWindow = Math.floor(MAX_VISIBLE_PAGES / 2);
  let start = Math.max(0, page - halfWindow);
  const end = Math.min(totalPages - 1, start + MAX_VISIBLE_PAGES - 1);

  if (end - start + 1 < MAX_VISIBLE_PAGES) {
    start = Math.max(0, end - MAX_VISIBLE_PAGES + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  const visiblePages = getVisiblePages(page, totalPages);
  const first = visiblePages[0];
  const last = visiblePages[visiblePages.length - 1];

  const pageButton = (target: number) => (
    <li key={target}>
      <button
        type="button"
        className={target === page ? 'pagination__page pagination__page--current' : 'pagination__page'}
        onClick={() => onPageChange(target)}
        aria-current={target === page ? 'page' : undefined}
        aria-label={`Página ${target + 1}`}
      >
        {target + 1}
      </button>
    </li>
  );

  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        type="button"
        className="pagination__step"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        <ChevronLeft aria-hidden="true" />
        Anterior
      </button>

      <ol className="pagination__pages tabular-nums">
        {first > 0 && pageButton(0)}
        {first > 1 && <li className="pagination__ellipsis" aria-hidden="true">…</li>}
        {visiblePages.map(pageButton)}
        {last < totalPages - 2 && <li className="pagination__ellipsis" aria-hidden="true">…</li>}
        {last < totalPages - 1 && pageButton(totalPages - 1)}
      </ol>

      <button
        type="button"
        className="pagination__step"
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= totalPages}
      >
        Siguiente
        <ChevronRight aria-hidden="true" />
      </button>

      <span className="pagination__info tabular-nums">
        Página {page + 1} de {totalPages}
      </span>
    </nav>
  );
};
