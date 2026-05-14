import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtMoney } from "@/lib/utils";
import type { Vehiculo } from "@/lib/types";

interface VehiculoCardProps {
  vehiculo: Vehiculo;
  readOnly?: boolean;
}

export function VehiculoCard({ vehiculo, readOnly = false }: VehiculoCardProps) {
  return (
    <article className="veh-card">
      <div className="veh-photo">
        {vehiculo.fotos && vehiculo.fotos[0]
          ? <img src={vehiculo.fotos[0]} alt={`${vehiculo.marca} ${vehiculo.modelo}`} />
          : <div className="photo-ph">[ foto del vehículo ]</div>}
      </div>
      <div className="veh-body">
        <div>
          <div className="title">{vehiculo.marca} {vehiculo.modelo}</div>
          <div className="sub">{vehiculo.ubicacion}</div>
        </div>
        <div className="price">
          {fmtMoney(vehiculo.precio)}
          <small>/ día</small>
        </div>
      </div>
      <div className="veh-foot">
        <span className="loc">
          <Icon name="pin" size={14} /> {vehiculo.ubicacion}
        </span>
        {!readOnly && (
          <Link href={`/dashboard/vehiculos/${vehiculo.id_vehiculo}/editar`}>
            Ver detalles
          </Link>
        )}
      </div>
    </article>
  );
}