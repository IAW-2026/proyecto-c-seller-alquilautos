import { VehiculoForm } from "@/components/features/vehiculos/VehiculoForm";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export default function NuevoVehiculoPage() {
  return (
    <div style={{ maxWidth: 880 }}>
      <div className="page-header">
        <div>
          <h2>Nuevo vehículo</h2>
          <div className="sub">Completá los datos para publicar tu auto.</div>
        </div>
        <Link href="/dashboard/vehiculos" className="btn ghost">
          <Icon name="chevronLeft" size={14} /> Volver
        </Link>
      </div>
      <VehiculoForm />
    </div>
  );
}