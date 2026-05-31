"use client";
import { Icon } from "./Icon";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const btnBase = "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] w-[30px] h-[30px] rounded-[var(--radius-md)] text-[12px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const range: number[] = [];
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  for (let i = start; i <= Math.min(totalPages, start + 2); i++) range.push(i);

  return (
    <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] bg-[var(--bg-page)]">
      <span>Página {page} de {totalPages}</span>
      <div className="flex gap-[4px]">
        <button
          className={btnBase}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Anterior"
        >
          <Icon name="chevronLeft" size={14} />
        </button>
        {range.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={[
              btnBase,
              p === page ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)]" : "",
            ].join(" ")}
          >
            {p}
          </button>
        ))}
        <button
          className={btnBase}
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Siguiente"
        >
          <Icon name="chevronRight" size={14} />
        </button>
      </div>
    </div>
  );
}