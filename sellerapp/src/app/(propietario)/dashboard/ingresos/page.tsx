import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getReservasByPropietario } from "@/lib/services/reserva.service";
import { getVehiculosByPropietario } from "@/lib/services/vehiculo.service";
import { getAlquilador } from "@/lib/mocks/buyerApp";
import { fmtDate, fmtMoney, daysBetween } from "@/lib/utils";

export default async function IngresosPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const [reservasResult, vehiculosResult] = await Promise.all([
    getReservasByPropietario(id_propietario),
    getVehiculosByPropietario(id_propietario),
  ]);

  const reservas = reservasResult.data?.reservas ?? [];
  const vehiculos = vehiculosResult.data?.vehiculos ?? [];

  const finalizadas = reservas.filter(r => r.estado === "Finalizada");

  const vehiculosMap = Object.fromEntries(
    vehiculos.map(v => [v.id_vehiculo, v])
  );

  const totalMes = finalizadas.reduce((sum, r) => {
    const v = vehiculosMap[r.id_vehiculo];
    const dias = daysBetween(r.fecha_inicio, r.fecha_final);
    return sum + (v ? Number(v.precio) * dias : 0);
  }, 0);

  const ticketPromedio = finalizadas.length > 0 ? totalMes / finalizadas.length : 0;

  const alquiladoresMap: Record<string, Awaited<ReturnType<typeof getAlquilador>>> = {};
  await Promise.all(
    finalizadas.map(async r => {
      alquiladoresMap[r.id_alquilador] = await getAlquilador(r.id_alquilador);
    })
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Ingresos</h2>
          <div className="sub">Resumen de tus cobros del mes</div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Total del mes</div>
          <div className="value">{fmtMoney(totalMes)}</div>
        </div>
        <div className="kpi">
          <div className="label">Reservas finalizadas</div>
          <div className="value">{finalizadas.length}</div>
        </div>
        <div className="kpi">
          <div className="label">Precio promedio</div>
          <div className="value">{fmtMoney(ticketPromedio)}</div>
        </div>
      </div>

      <div className="section-head">
        <h3>Detalle</h3>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Vehículo</th>
              <th>Alquilador</th>
              <th>Días</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {finalizadas.map(r => {
              const v = vehiculosMap[r.id_vehiculo];
              const al = alquiladoresMap[r.id_alquilador];
              const dias = daysBetween(r.fecha_inicio, r.fecha_final);
              const monto = v ? Number(v.precio) * dias : 0;
              return (
                <tr key={r.id_reserva}>
                  <td>{fmtDate(r.fecha_inicio)}</td>
                  <td>{v ? `${v.marca} ${v.modelo}` : r.id_vehiculo}</td>
                  <td>{al ? `${al.nombre} ${al.apellido}` : r.id_alquilador}</td>
                  <td>{dias}</td>
                  <td><strong className="text-primary-c">{fmtMoney(monto)}</strong></td>
                </tr>
              );
            })}
            {finalizadas.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)", padding: 32 }}>
                  No hay ingresos registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}