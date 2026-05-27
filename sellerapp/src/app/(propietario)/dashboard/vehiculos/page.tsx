import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getVehiculosByPropietario } from "@/lib/services/vehiculo.service";
import { VehiculoCard } from "@/components/features/vehiculos/VehiculoCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

const PAGE_SIZE = 6;

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = parseInt(pageParam, 10);

  const result = await getVehiculosByPropietario(id_propietario);
  const todos = result.data?.vehiculos ?? [];

  const filtered = todos.filter(v => {
    const s = q.toLowerCase();
    return !s || `${v.marca} ${v.modelo}`.toLowerCase().includes(s) || v.anio.toString().includes(s);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Mi Flota</h2>
          <div className="sub">{filtered.length} vehículo{filtered.length === 1 ? "" : "s"} en tu cuenta</div>
        </div>
        <Link href="/dashboard/vehiculos/nuevo" className="btn primary">
          <Icon name="plus" size={14} /> Añadir Vehículo
        </Link>
      </div>

      <div className="table-wrap" style={{ marginBottom: 20 }}>
        <div className="table-toolbar">
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
            <span className="text-secondary">{filtered.length} resultados</span>
          </div>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon="car"
            title="Sin resultados"
            message={q ? `No encontramos vehículos para "${q}"` : "No tenés vehículos cargados aún."}
            action={
              !q && (
                <Link href="/dashboard/vehiculos/nuevo" className="btn primary">
                  <Icon name="plus" size={14} /> Añadir Vehículo
                </Link>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="veh-grid">
            {pageItems.map(v => (
              <VehiculoCard key={v.id_vehiculo} vehiculo={v} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: 20 }}>
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
  );
}