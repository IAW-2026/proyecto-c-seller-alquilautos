import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { EditarPropietarioModal } from "@/components/features/admin/EditarPropietarioModal";
import { EliminarPropietarioButton } from "@/components/features/admin/EliminarPropietarioButton";
import { ExportExcelButton } from "@/components/features/admin/ExportExcelButton";
import { exportarPropietariosAction } from "@/lib/actions/admin.actions";


const PAGE_SIZE = 8;
const thClass   = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
const tdClass   = "px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle";
const linkBtnSmClass = "inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]";

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
      { nombre:   { contains: q, mode: "insensitive" as const } },
      { apellido: { contains: q, mode: "insensitive" as const } },
      { email:    { contains: q, mode: "insensitive" as const } },
      { dni:      { contains: q, mode: "insensitive" as const } },
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
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Propietarios</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">{total} registro{total === 1 ? "" : "s"} en total</div>
        </div>
      </div>

      {/* Toolbar + table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="flex gap-3 items-center px-4 py-[14px] border-b border-[var(--border-default)] flex-wrap">
          <form>
            <input
              type="search" name="q" defaultValue={q}
              placeholder="Buscar por nombre, email o DNI..."
              aria-label="Buscar propietarios"
              className="border border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-[inherit] outline-none min-w-[240px]"
            />
          </form>
          {q && (
            <Link
              href="/admin/propietarios"
              className="inline-flex items-center justify-center gap-2 border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] px-[16px] py-[9px]"
            >
              Limpiar filtros
            </Link>
          )}
          <div className="ml-auto">
            <ExportExcelButton action={exportarPropietariosAction} params={{ q }} filename="propietarios.xlsx" />
          </div>
        </div>

        {propietarios.length === 0 ? (
          <EmptyState
            icon="user"
            title="Sin resultados"
            message={q ? "No encontramos propietarios que coincidan con la búsqueda." : "No hay propietarios registrados."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse max-[900px]:min-w-[700px]">
                <thead>
                  <tr>
                    {["Propietario", "Email", "DNI", "Dirección", "Vehículos", ""].map(h => (
                      <th key={h} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {propietarios.map(o => (
                    <tr key={o.id_propietario} className="hover:[&>td]:bg-[color-mix(in_srgb,var(--color-primary-400)_4%,transparent)]">
                      <td className={tdClass}>
                        <div className="font-semibold text-[var(--text-primary)]">{o.nombre} {o.apellido}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">ID {o.id_propietario}</div>
                      </td>
                      <td className={tdClass}>{o.email}</td>
                      <td className={tdClass}>{o.dni}</td>
                      <td className={tdClass}>{o.direccion}</td>
                      <td className={tdClass}><strong>{o._count.vehiculos}</strong></td>
                      <td className={tdClass}>
                        <div className="flex gap-2 justify-end">
                          <EditarPropietarioModal propietario={o} />
                          <EliminarPropietarioButton id_propietario={o.id_propietario} nombre={`${o.nombre} ${o.apellido}`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] bg-[var(--bg-page)]">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  {page > 1        && <Link href={`?q=${q}&page=${page - 1}`} className={linkBtnSmClass}>Anterior</Link>}
                  {page < totalPages && <Link href={`?q=${q}&page=${page + 1}`} className={linkBtnSmClass}>Siguiente</Link>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}