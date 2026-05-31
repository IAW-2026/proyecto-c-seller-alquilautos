import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

const PAGE_SIZE = 8;

export default async function AdminVehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") redirect("/dashboard");

  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = parseInt(pageParam, 10);

  const where = q ? {
    OR: [
      { marca: { contains: q, mode: "insensitive" as const } },
      { modelo: { contains: q, mode: "insensitive" as const } },
      { ubicacion: { contains: q, mode: "insensitive" as const } },
    ]
  } : {};

  const [vehiculos, total] = await Promise.all([
    db.vehiculo.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { propietario: true },
    }),
    db.vehiculo.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Vehículos</h2>
          <div className="sub">{total} registro{total === 1 ? "" : "s"} en total</div>
        </div>
      </div>
        <div className="table-toolbar" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",borderBottom: "none"}}>
          <form>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por marca, modelo o ubicación..."
              aria-label="Buscar vehículos"
            />
          </form>
          <div className="right">
            <span className="text-secondary">{total} resultados</span>
          </div>
        </div>
      <div className="table-wrap" style={{ borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
        {vehiculos.length === 0 ? (
          <EmptyState
            icon="car"
            title="Sin resultados"
            message="No encontramos vehículos con ese criterio."
          />
        ) : (
          <>
            <table className="data">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Propietario</th>
                  <th>Precio/día</th>
                  <th>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map(v => (
                  <tr key={v.id_vehiculo}>
                    <td>
                      <div className="cell-user">
                        {v.fotos && (
                          <img
                            src={v.fotos}
                            alt=""
                            style={{ borderRadius: "var(--radius-md)", width: 48, height: 32, objectFit: "cover" }}
                          />
                        )}
                        <div>
                          <div className="name">{v.marca} {v.modelo}</div>
                        </div>
                      </div>
                    </td>
                    <td>{v.propietario.nombre} {v.propietario.apellido}</td>
                    <td><strong className="text-primary-c">${Number(v.precio)}</strong></td>
                    <td>{v.anio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <span>Página {page} de {totalPages}</span>
                <div className="pages">
                  {page > 1 && (
                    <Link href={`?q=${q}&page=${page - 1}`} className="btn secondary sm">Anterior</Link>
                  )}
                  {page < totalPages && (
                    <Link href={`?q=${q}&page=${page + 1}`} className="btn secondary sm">Siguiente</Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}