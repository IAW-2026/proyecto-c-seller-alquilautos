import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)] px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[var(--radius-full)] bg-[color-mix(in_srgb,var(--color-primary-400)_12%,transparent)] text-[var(--color-primary-400)] mb-5">
          <Icon name="search" size={36} aria-hidden="true" />
        </div>

        <div className="text-[64px] font-bold leading-none text-[var(--color-primary-400)] mb-2">
          404
        </div>
        <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          La página que buscás no existe o fue movida.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary-400)] text-white font-semibold text-sm hover:bg-[var(--color-primary-500)] transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
