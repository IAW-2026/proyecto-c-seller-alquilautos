import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtMoney } from "@/lib/utils";
import type { Vehiculo } from "@/lib/types";

interface VehiculoCardProps {
  vehiculo: Vehiculo;
}

export function VehiculoCard({ vehiculo }: VehiculoCardProps) {
  return (
    <article className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] flex flex-col transition-[transform,box-shadow] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">

      {/* Foto */}
      <div className="relative aspect-[16/10] bg-[var(--color-neutral-100)] overflow-hidden">
        {vehiculo.fotos
          ? <img src={vehiculo.fotos} alt={`${vehiculo.marca} ${vehiculo.modelo}`} className="w-full h-full object-cover block" />
          : (
            <div className="w-full h-full grid place-items-center text-[var(--text-tertiary)] font-mono text-[12px]"
              style={{ background: "repeating-linear-gradient(45deg, var(--color-neutral-100) 0 10px, var(--color-neutral-200) 10px 20px)" }}>
              [ foto del vehículo ]
            </div>
          )
        }
        {vehiculo.estado && (
          <div className="absolute top-3 right-3">
            <StatusBadge estado={vehiculo.estado} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-[14px] pb-1 flex justify-between items-start gap-3">
        <div>
          <div className="font-bold text-[15px] text-[var(--text-primary)]">
            {vehiculo.marca} {vehiculo.modelo}
          </div>
          <div className="text-[var(--text-secondary)] text-[12px] mt-[2px]">{vehiculo.anio}</div>
        </div>
        <div className="font-bold text-[var(--color-primary-400)] text-[18px] text-right shrink-0">
          {fmtMoney(vehiculo.precio)}
          <small className="block text-[var(--text-secondary)] font-medium text-[11px]">/ día</small>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border-default)] flex justify-between items-center mt-2 text-[13px]">
        <span className="text-[var(--text-secondary)] inline-flex items-center gap-[6px]">
          <Icon name="car" size={14} aria-hidden="true" /> {vehiculo.anio}
        </span>
        <Link
          href={`/dashboard/vehiculos/${vehiculo.id_vehiculo}`}
         className="inline-flex items-center justify-center gap-2 px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)] transition-[background] duration-[180ms]"
        >
          Visitar
        </Link>
      </div>
    </article>
  );
}