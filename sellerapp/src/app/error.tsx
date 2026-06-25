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

  const mensaje = process.env.NODE_ENV === "development"
    ? error.message
    : "Algo salió mal, intentá de nuevo.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)] px-4">
      <div className="text-center max-w-md">
        <svg
          width="96" height="96" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-danger-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="mx-auto mb-6"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 7.5v6" />
          <path d="M12 16.8h.01" />
        </svg>

        <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8 break-words">
          {mensaje}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary-400)] text-white font-semibold text-sm hover:bg-[var(--color-primary-500)] transition-colors"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold text-sm hover:bg-[var(--bg-hover)] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
