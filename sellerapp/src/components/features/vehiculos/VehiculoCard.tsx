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
    <article className="veh-card">
      <div className="veh-photo">
        {vehiculo.fotos && vehiculo.fotos[0]
          ? <img src={vehiculo.fotos[0]} alt={`${vehiculo.marca} ${vehiculo.modelo}`} />
          : <div className="photo-ph">[ foto del vehículo ]</div>}
        {vehiculo.estado && (
          <div className="status">
            <StatusBadge estado={vehiculo.estado} />
          </div>
        )}
      </div>
      <div className="veh-body">
        <div>
          <div className="title">{vehiculo.marca} {vehiculo.modelo}</div>
          <div className="sub">{vehiculo.anio}</div>
        </div>
        <div className="price">
          {fmtMoney(vehiculo.precio)}
          <small>/ día</small>
        </div>
      </div>
      <div className="veh-foot">
        <span className="loc">
          <Icon name="car" size={14} /> {vehiculo.anio}
        </span>
        <Link href={`/dashboard/vehiculos/${vehiculo.id_vehiculo}`} className="btn primary sm">
          Visitar
        </Link>
      </div>
    </article>
  );
}