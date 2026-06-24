// src/app/api/metricas/resumen-general/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  // Solo admins pueden consultar métricas
  if (role !== "adminGlobal") {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  try {
    const [
      totalPropietarios,
      vehiculosStats,
      reservasStats,
      reservasFinalizadas,
    ] = await Promise.all([
      db.propietario.count(),
      db.vehiculo.groupBy({ by: ["estado"], _count: { _all: true } }),
      db.reserva.groupBy({ by: ["estado"], _count: { _all: true } }),
      db.reserva.findMany({
        where: { estado: "Finalizada" },
        include: { vehiculo: { select: { precio: true } } },
      }),
    ]);

    const totalVehiculos = vehiculosStats.reduce((acc, g) => acc + g._count._all, 0);
    const disponibles = vehiculosStats.find((g) => g.estado === "Disponible")?._count._all ?? 0;
    const alquilados = vehiculosStats.find((g) => g.estado === "Alquilado")?._count._all ?? 0;

    const totalReservas = reservasStats.reduce((acc, g) => acc + g._count._all, 0);
    const porEstado: Record<string, number> = {};
    for (const g of reservasStats) porEstado[g.estado] = g._count._all;

    let ingresos_totales_ars = 0;
    for (const r of reservasFinalizadas) {
      const dias = Math.max(
        1,
        Math.ceil(
          (new Date(r.fecha_final).getTime() - new Date(r.fecha_inicio).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      ingresos_totales_ars += Number(r.vehiculo.precio) * dias;
    }

    return NextResponse.json(
      {
        data: {
          total_propietarios: totalPropietarios,
          vehiculos: { total: totalVehiculos, disponibles, alquilados },
          reservas: { total: totalReservas, por_estado: porEstado },
          ingresos_totales_ars,
        },
        error: null,
      },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[metricas/resumen-general]", error);
    return NextResponse.json({ data: null, error: "Error interno" }, { status: 500 });
  }
}