import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SimuladorCliente } from "@/components/features/admin/SimuladorCliente";

// ===== SIMULADOR ===== se borra para etapa 3

export default async function SimuladorPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") redirect("/dashboard");

  const reservas = await db.reserva.findMany({
    where: {
      estado: {
        notIn: ["Finalizada", "Rechazada", "Cancelada"],
      },
    },
    orderBy: { createdAt: "desc" },
    include: { vehiculo: true, propietario: true },
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Simulador de flujo</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">Simulá el flujo completo de una reserva</div>
        </div>
      </div>
      <SimuladorCliente reservas={reservas.map(r => ({
        id_reserva: r.id_reserva,
        estado: r.estado,
        id_alquilador: r.id_alquilador,
        fecha_inicio: r.fecha_inicio.toISOString(),
        fecha_final: r.fecha_final.toISOString(),
        vehiculo: { marca: r.vehiculo.marca, modelo: r.vehiculo.modelo },
        propietario: { nombre: r.propietario.nombre, apellido: r.propietario.apellido },
      }))} />
    </div>
  );
}