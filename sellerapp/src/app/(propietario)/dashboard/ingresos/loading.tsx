import { Skeleton } from "@/components/ui/Skeleton";

const kpiClass = "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-5 py-[18px] shadow-[var(--shadow-sm)]";
const thClass  = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
const tdClass  = "px-4 py-[14px] border-b border-[var(--border-default)] align-middle";

export default function IngresosLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <Skeleton className="h-[22px] w-[90px]" />
          <Skeleton className="h-[13px] w-[280px] mt-2" />
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          {[120, 140].map((w, i) => (
            <div key={i} className="flex flex-col gap-[4px]">
              <Skeleton className="h-[11px] w-[50px]" />
              <Skeleton className="h-[38px]" style={{ width: w }} />
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-[14px] mb-7" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={kpiClass}>
            <Skeleton className="h-[12px] w-[110px]" />
            <Skeleton className="h-[26px] w-[120px] mt-2" />
            <Skeleton className="h-[11px] w-[80px] mt-2" />
          </div>
        ))}
      </div>

      {/* Section head */}
      <div className="flex items-center justify-between gap-[10px] mt-7 mb-[14px] flex-wrap">
        <Skeleton className="h-[17px] w-[70px]" />
        <div className="flex gap-2">
          <Skeleton className="h-[34px] w-[80px]" />
          <Skeleton className="h-[34px] w-[70px]" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse max-[900px]:min-w-[700px]">
            <thead>
              <tr>
                {["Fecha", "Vehículo", "Alquilador", "Días", "Monto"].map((h, i) => (
                  <th key={i} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[70px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[110px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[120px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[20px]" /></td>
                  <td className={tdClass}>
                    <Skeleton className="h-[13px] w-[90px]" />
                    <Skeleton className="h-[11px] w-[60px] mt-1" />
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
