import { Skeleton } from "@/components/ui/Skeleton";

const thClass = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
const tdClass = "px-4 py-[14px] border-b border-[var(--border-default)] align-middle last:border-b-0";

export default function ReservasLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <Skeleton className="h-[22px] w-[100px]" />
          <Skeleton className="h-[13px] w-[260px] mt-2" />
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          {[64, 80, 140].map((w, i) => (
            <div key={i} className="flex flex-col gap-[4px]">
              <Skeleton className="h-[11px] w-[50px]" />
              <Skeleton className="h-[38px]" style={{ width: w }} />
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse max-[900px]:min-w-[700px]">
            <thead>
              <tr>
                {["Alquilador", "Vehículo", "Fechas", "Días", "Estado", ""].map((h, i) => (
                  <th key={i} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className={tdClass}>
                    <Skeleton className="h-[13px] w-[110px]" />
                    <Skeleton className="h-[11px] w-[140px] mt-1" />
                  </td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[100px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[150px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[20px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[22px] w-[80px] rounded-[var(--radius-full)]" /></td>
                  <td className={tdClass}>
                    <div className="flex gap-2 justify-end">
                      <Skeleton className="h-[28px] w-[60px]" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
