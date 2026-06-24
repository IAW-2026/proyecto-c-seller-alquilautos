// src/app/api/metricas/ocupacion-vehiculos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { EstadoReserva } from "@prisma/client";

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
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");

  const desde = desdeParam ? new Date(desdeParam) : null;
  const hasta = hastaParam ? new Date(hastaParam) : null;

  if (!desde || !hasta || isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
    return NextResponse.json(
      { data: null, error: "Parámetros desde y hasta requeridos y válidos" },
      { status: 400 }
    );
  }

  const dias_totales = Math.max(
    1,
    Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Estados que cuentan como "ocupado" en algún momento del período
  const ESTADOS_OCUPADO: EstadoReserva[] = [
    EstadoReserva.Coordinada,
    EstadoReserva.Pagada,
    EstadoReserva.Entregada,
    EstadoReserva.Finalizada,
  ];

  try {
    const vehiculos = await db.vehiculo.findMany({
      select: {
        id_vehiculo: true,
        marca: true,
        modelo: true,
        reservas: {
          where: {
            estado: { in: ESTADOS_OCUPADO },
            fecha_inicio: { lte: hasta },
            fecha_final: { gte: desde },
          },
          select: { fecha_inicio: true, fecha_final: true },
        },
      },
    });

    const resultado = vehiculos.map((v) => {
      // Sin overlaps posibles: sumar directo cada reserva recortada al rango
      let dias_alquilados = 0;

      for (const r of v.reservas) {
        const inicioEfectivo = new Date(Math.max(new Date(r.fecha_inicio).getTime(), desde.getTime()));
        const finEfectivo = new Date(Math.min(new Date(r.fecha_final).getTime(), hasta.getTime()));

        if (finEfectivo > inicioEfectivo) {
          dias_alquilados += Math.ceil(
            (finEfectivo.getTime() - inicioEfectivo.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      }

      const porcentaje = Number(((dias_alquilados / dias_totales) * 100).toFixed(2));

      return {
        id_vehiculo: v.id_vehiculo,
        marca: v.marca,
        modelo: v.modelo,
        dias_alquilados,
        dias_totales,
        porcentaje,
      };
    });

    const ocupacion_promedio_plataforma =
      resultado.length > 0
        ? Number(
            (resultado.reduce((acc, v) => acc + v.porcentaje, 0) / resultado.length).toFixed(2)
          )
        : 0;

    return NextResponse.json(
      {
        data: { ocupacion_promedio_plataforma, vehiculos: resultado },
        error: null,
      },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[metricas/ocupacion-vehiculos]", error);
    return NextResponse.json({ data: null, error: "Error interno" }, { status: 500 });
  }
}