"use client";
import { Icon } from "./Icon";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const range: number[] = [];
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  for (let i = start; i <= Math.min(totalPages, start + 2); i++) range.push(i);
  return (
    <div className="pagination">
      <span>Página {page} de {totalPages}</span>
      <div className="pages">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Anterior">
          <Icon name="chevronLeft" size={14} />
        </button>
        {range.map(p => (
          <button key={p} className={p === page ? "active" : ""} onClick={() => onChange(p)}>{p}</button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Siguiente">
          <Icon name="chevronRight" size={14} />
        </button>
      </div>
    </div>
  );
}