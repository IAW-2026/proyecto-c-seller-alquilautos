import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") redirect("/dashboard");

  const [propietarios, vehiculos, reservas] = await Promise.all([
    db.propietario.count(),
    db.vehiculo.count(),
    db.reserva.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const pendientes = await db.reserva.count({ where: { estado: "Pendiente" } });
  const aceptadas = await db.reserva.count({ where: { estado: "Aceptada" } });
  const rechazadas = await db.reserva.count({ where: { estado: "Rechazada" } });
  const totalReservas = pendientes + aceptadas + rechazadas;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Resumen de la plataforma</h2>
          <div className="sub">Indicadores globales de AlquilAutos</div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Propietarios</div>
          <div className="value">{propietarios}</div>
        </div>
        <div className="kpi">
          <div className="label">Vehículos publicados</div>
          <div className="value">{vehiculos}</div>
        </div>
        <div className="kpi">
          <div className="label">Reservas totales</div>
          <div className="value">{totalReservas}</div>
        </div>
        <div className="kpi">
          <div className="label">Pendientes</div>
          <div className="value">{pendientes}</div>
          <div className="delta">Requieren acción</div>
        </div>
        <div className="kpi">
          <div className="label">Aceptadas</div>
          <div className="value">{aceptadas}</div>
          <div className="delta">
            {totalReservas > 0 ? Math.round(aceptadas / totalReservas * 100) : 0}% tasa
          </div>
        </div>
        <div className="kpi danger">
          <div className="label">Rechazadas</div>
          <div className="value">{rechazadas}</div>
          <div className="delta">
            {totalReservas > 0 ? Math.round(rechazadas / totalReservas * 100) : 0}% tasa
          </div>
        </div>
      </div>

      <div className="section-head"><h3>Reservas recientes</h3></div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>ID Alquilador</th>
              <th>ID Vehículo</th>
              <th>ID Propietario</th>
              <th>Fechas</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id_reserva}>
                <td>{r.id_alquilador}</td>
                <td>{r.id_vehiculo}</td>
                <td>{r.id_propietario}</td>
                <td>{fmtDate(r.fecha_inicio)} → {fmtDate(r.fecha_final)}</td>
                <td><StatusBadge estado={r.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}