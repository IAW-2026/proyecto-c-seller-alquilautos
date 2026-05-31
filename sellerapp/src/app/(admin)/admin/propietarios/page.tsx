import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

const PAGE_SIZE = 8;

export default async function AdminPropietariosPage({
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
      { nombre: { contains: q, mode: "insensitive" as const } },
      { apellido: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
      { dni: { contains: q, mode: "insensitive" as const } },
    ]
  } : {};

  const [propietarios, total] = await Promise.all([
    db.propietario.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { vehiculos: true } } },
    }),
    db.propietario.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Propietarios</h2>
          <div className="sub">{total} registro{total === 1 ? "" : "s"} en total</div>
        </div>
      </div>
        <div className="table-toolbar" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",borderBottom: "none"}}>
          <form>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre, email o DNI..."
              aria-label="Buscar propietarios"
            />
          </form>
          <div className="right">
            <span className="text-secondary">{total} resultados</span>
          </div>
        </div>
      <div className="table-wrap" style={{ borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
        {propietarios.length === 0 ? (
          <EmptyState
            icon="user"
            title="Sin resultados"
            message="No encontramos propietarios con ese criterio."
          />
        ) : (
          <>
            <table className="data">
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Email</th>
                  <th>DNI</th>
                  <th>Dirección</th>
                  <th>Vehículos</th>
                </tr>
              </thead>
              <tbody>
                {propietarios.map(o => (
                  <tr key={o.id_propietario}>
                    <td>
                      <div className="cell-user">
                        <div>
                          <div className="name">{o.nombre} {o.apellido}</div>
                          <div className="sub text-secondary">ID {o.id_propietario}</div>
                        </div>
                      </div>
                    </td>
                    <td>{o.email}</td>
                    <td>{o.dni}</td>
                    <td>{o.direccion}</td>
                    <td><strong>{o._count.vehiculos}</strong></td>
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