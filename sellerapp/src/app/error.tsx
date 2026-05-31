"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)] px-4">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-bold leading-none text-[var(--color-danger-500)] mb-4">
          500
        </div>
        <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          Ocurrió un error inesperado. Podés intentar de nuevo o volver al dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary-400)] text-white font-semibold text-sm hover:bg-[var(--color-primary-500)] transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold text-sm hover:bg-[var(--bg-hover)] transition-colors"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}