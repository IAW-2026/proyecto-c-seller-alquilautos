import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

function getPeriodoKey(fecha: Date, granularity: "month" | "week"): string {
  if (granularity === "week") {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    // ISO week: jueves de esa semana determina el año
    const dayNum = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - dayNum);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  }
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminGlobal") {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const granularity = (searchParams.get("granularity") === "week" ? "week" : "month") as
    | "month"
    | "week";
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");

  const desde = desdeParam ? new Date(desdeParam) : new Date(0);
  const hasta = hastaParam ? new Date(hastaParam) : new Date();

  if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
    return NextResponse.json({ data: null, error: "Fechas inválidas" }, { status: 400 });
  }

  try {
    const reservas = await db.reserva.findMany({
      where: {
        estado: "Finalizada",
        fecha_final: { gte: desde, lte: hasta },
      },
      include: { vehiculo: { select: { precio: true } } },
    });

    const mapa = new Map<string, { ingresos: number; cantidad_reservas: number }>();

    for (const r of reservas) {
      const dias = Math.max(
        1,
        Math.ceil(
          (new Date(r.fecha_final).getTime() - new Date(r.fecha_inicio).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      const ingreso = Number(r.vehiculo.precio) * dias;
      const key = getPeriodoKey(new Date(r.fecha_final), granularity);

      if (mapa.has(key)) {
        const entry = mapa.get(key)!;
        entry.ingresos += ingreso;
        entry.cantidad_reservas += 1;
      } else {
        mapa.set(key, { ingresos: ingreso, cantidad_reservas: 1 });
      }
    }

    const resultado = Array.from(mapa.entries())
      .map(([periodo, v]) => ({ periodo, ...v }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));

    return NextResponse.json(
      { data: resultado, error: null },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[metricas/ingresos-por-periodo]", error);
    return NextResponse.json({ data: null, error: "Error interno" }, { status: 500 });
  }
}