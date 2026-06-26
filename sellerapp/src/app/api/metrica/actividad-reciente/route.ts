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
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "5"), 50);

  try {
    const [ultimasReservas, nuevosPropietarios] = await Promise.all([
      db.reserva.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id_reserva: true,
          estado: true,
          id_propietario: true,
          createdAt: true,
          vehiculo: { select: { marca: true, modelo: true } },
        },
      }),
      db.propietario.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id_propietario: true,
          nombre: true,
          apellido: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

    const ultimas_reservas = ultimasReservas.map((r) => ({
      id_reserva: r.id_reserva,
      estado: r.estado,
      id_propietario: r.id_propietario,
      vehiculo: `${r.vehiculo.marca} ${r.vehiculo.modelo}`,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(
      {
        data: {
          ultimas_reservas,
          nuevos_propietarios: nuevosPropietarios,
        },
        error: null,
      },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[metricas/actividad-reciente]", error);
    return NextResponse.json({ data: null, error: "Error interno" }, { status: 500 });
  }
}