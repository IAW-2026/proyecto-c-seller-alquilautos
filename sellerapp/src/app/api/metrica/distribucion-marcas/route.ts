// src/app/api/metricas/distribucion-marcas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  try {
    const vehiculos = await db.vehiculo.findMany({
      select: {
        marca: true,
        reservas: {
          where: { estado: "Finalizada" },
          select: {
            fecha_inicio: true,
            fecha_final: true,
            vehiculo: { select: { precio: true } },
          },
        },
      },
    });

    const mapa = new Map<
      string,
      { cantidad_vehiculos: number; cantidad_reservas_finalizadas: number; ingresos_totales: number }
    >();

    for (const v of vehiculos) {
      if (!mapa.has(v.marca)) {
        mapa.set(v.marca, {
          cantidad_vehiculos: 0,
          cantidad_reservas_finalizadas: 0,
          ingresos_totales: 0,
        });
      }
      const entry = mapa.get(v.marca)!;
      entry.cantidad_vehiculos += 1;

      for (const r of v.reservas) {
        const dias = Math.max(
          1,
          Math.ceil(
            (new Date(r.fecha_final).getTime() - new Date(r.fecha_inicio).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        entry.cantidad_reservas_finalizadas += 1;
        entry.ingresos_totales += Number(r.vehiculo.precio) * dias;
      }
    }

    const resultado = Array.from(mapa.entries())
      .map(([marca, v]) => ({ marca, ...v }))
      .sort((a, b) => b.ingresos_totales - a.ingresos_totales);

    return NextResponse.json(
      { data: resultado, error: null },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[metricas/distribucion-marcas]", error);
    return NextResponse.json({ data: null, error: "Error interno" }, { status: 500 });
  }
}