import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { daysBetween } from "@/lib/utils";

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
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  try {
    const propietarios = await db.propietario.findMany({
      select: {
        id_propietario: true,
        nombre: true,
        apellido: true,
        email: true,
        _count: { select: { vehiculos: true } },
        reservas: {
          where: { estado: "Finalizada" },
          include: { vehiculo: { select: { precio: true } } },
        },
      },
    });

    const resultado = propietarios
      .map((p) => {
        let ingresos_totales = 0;
        for (const r of p.reservas) {
          const dias = daysBetween(r.fecha_inicio, r.fecha_final);
          ingresos_totales += Number(r.vehiculo.precio) * dias;
        }

        return {
          id_propietario: p.id_propietario,
          nombre: p.nombre,
          apellido: p.apellido,
          email: p.email,
          cantidad_vehiculos: p._count.vehiculos,
          cantidad_reservas_finalizadas: p.reservas.length,
          ingresos_totales,
        };
      })
      .sort((a, b) => b.ingresos_totales - a.ingresos_totales)
      .slice(0, limit);

    return NextResponse.json(
      { data: resultado, error: null },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[metricas/propietarios-top]", error);
    return NextResponse.json({ data: null, error: "Error interno" }, { status: 500 });
  }
}