// src/app/api/metricas/tasa-conversion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminGlobal") {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  try {
    const [totalReservas, finalizadasData, canceladas, rechazadas] = await Promise.all([
      db.reserva.count(),
      db.reserva.findMany({
        where: { estado: "Finalizada" },
        select: { fecha_inicio: true, fecha_final: true },
      }),
      db.reserva.count({ where: { estado: "Cancelada" } }),
      db.reserva.count({ where: { estado: "Rechazada" } }),
    ]);

    const finalizadas = finalizadasData.length;
    const canceladasTotal = canceladas + rechazadas;

    const tasa_conversion = totalReservas > 0 ? (finalizadas / totalReservas) * 100 : 0;
    const tasa_cancelacion = totalReservas > 0 ? (canceladasTotal / totalReservas) * 100 : 0;

    let tiempo_promedio_ciclo_dias = 0;
    if (finalizadas > 0) {
      const totalDias = finalizadasData.reduce((acc, r) => {
        const dias =
          (new Date(r.fecha_final).getTime() - new Date(r.fecha_inicio).getTime()) /
          (1000 * 60 * 60 * 24);
        return acc + dias;
      }, 0);
      tiempo_promedio_ciclo_dias = totalDias / finalizadas;
    }

    return NextResponse.json(
      {
        data: {
          total_reservas: totalReservas,
          finalizadas,
          canceladas: canceladasTotal,
          tasa_conversion: Number(tasa_conversion.toFixed(2)),
          tasa_cancelacion: Number(tasa_cancelacion.toFixed(2)),
          tiempo_promedio_ciclo_dias: Number(tiempo_promedio_ciclo_dias.toFixed(2)),
        },
        error: null,
      },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[metricas/tasa-conversion]", error);
    return NextResponse.json({ data: null, error: "Error interno" }, { status: 500 });
  }
}