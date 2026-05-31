import { VehiculoForm } from "@/components/features/vehiculos/VehiculoForm";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export default function NuevoVehiculoPage() {
  return (
    <div className="max-w-[880px]">
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Nuevo vehículo</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">Completá los datos para publicar tu auto.</div>
        </div>
        <Link
          href="/dashboard/vehiculos"
          className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]"
        >
          <Icon name="chevronLeft" size={14} /> Volver
        </Link>
      </div>
      <VehiculoForm />
    </div>
  );
}