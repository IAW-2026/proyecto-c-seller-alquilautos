import { Skeleton } from "@/components/ui/Skeleton";

export default function VehiculosLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <Skeleton className="h-[22px] w-[140px]" />
          <Skeleton className="h-[13px] w-[180px] mt-2" />
        </div>
        <Skeleton className="h-[37px] w-[160px]" />
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] mb-5">
        <div className="flex gap-3 items-center px-4 py-[14px] border-b border-[var(--border-default)] flex-wrap">
          <Skeleton className="h-[38px] w-[240px]" />
          <div className="ml-auto">
            <Skeleton className="h-[13px] w-[70px]" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] flex flex-col"
          >
            <Skeleton className="aspect-[16/10] w-full rounded-none" />

            <div className="px-4 pt-[14px] pb-1 flex justify-between items-start gap-3">
              <div>
                <Skeleton className="h-[15px] w-[120px]" />
                <Skeleton className="h-[12px] w-[50px] mt-2" />
              </div>
              <Skeleton className="h-[18px] w-[70px]" />
            </div>

            <div className="px-4 py-3 border-t border-[var(--border-default)] flex justify-between items-center mt-2">
              <Skeleton className="h-[13px] w-[50px]" />
              <Skeleton className="h-[28px] w-[70px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
