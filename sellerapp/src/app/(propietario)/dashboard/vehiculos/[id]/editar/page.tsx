import { getVehiculo } from "@/lib/services/vehiculo.service";
import { VehiculoForm } from "@/components/features/vehiculos/VehiculoForm";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditarVehiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getVehiculo(id);

  if (result.error || !result.data) notFound();

  const vehiculo = {
    ...result.data,
    precio: Number(result.data.precio),
  };

  return (
    <div style={{ maxWidth: 880 }}>
      <div className="page-header">
        <div>
          <h2>Editar: {vehiculo.marca} {vehiculo.modelo}</h2>
          <div className="sub">Actualizá los datos de tu vehículo.</div>
        </div>
        <Link href="/dashboard/vehiculos" className="btn ghost">
          <Icon name="chevronLeft" size={14} /> Volver
        </Link>
      </div>
      <VehiculoForm vehiculo={vehiculo} />
    </div>
  );
}