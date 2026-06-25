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

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  try {
    const reservasFinalizadas = await db.reserva.findMany({
      where: { estado: "Finalizada" },
      include: {
        vehiculo: {
          select: {
            id_vehiculo: true,
            marca: true,
            modelo: true,
            anio: true,
            precio: true,
            id_propietario: true,
            propietario: { select: { nombre: true, apellido: true } },
          },
        },
      },
    });

    const mapaVehiculos = new Map<
      string,
      {
        id_vehiculo: string;
        marca: string;
        modelo: string;
        anio: number;
        id_propietario: string;
        propietario: { nombre: string; apellido: string };
        cantidad_alquileres: number;
        ingresos_generados: number;
      }
    >();

    for (const r of reservasFinalizadas) {
      const v = r.vehiculo;
      const dias = Math.max(
        1,
        Math.ceil(
          (new Date(r.fecha_final).getTime() - new Date(r.fecha_inicio).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      const ingreso = Number(v.precio) * dias;

      if (mapaVehiculos.has(v.id_vehiculo)) {
        const entry = mapaVehiculos.get(v.id_vehiculo)!;
        entry.cantidad_alquileres += 1;
        entry.ingresos_generados += ingreso;
      } else {
        mapaVehiculos.set(v.id_vehiculo, {
          id_vehiculo: v.id_vehiculo,
          marca: v.marca,
          modelo: v.modelo,
          anio: v.anio,
          id_propietario: v.id_propietario,
          propietario: v.propietario,
          cantidad_alquileres: 1,
          ingresos_generados: ingreso,
        });
      }
    }

    const resultado = Array.from(mapaVehiculos.values())
      .sort((a, b) => b.cantidad_alquileres - a.cantidad_alquileres)
      .slice(0, limit);

    return NextResponse.json(
      { data: resultado, error: null },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[metricas/vehiculos-top]", error);
    return NextResponse.json({ data: null, error: "Error interno" }, { status: 500 });
  }
}