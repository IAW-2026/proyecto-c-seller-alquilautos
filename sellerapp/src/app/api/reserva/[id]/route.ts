import { NextResponse } from "next/server";
import { getReserva, actualizarEstadoReserva, cancelarReserva, coordinarReserva    } from "@/lib/services/reserva.service";
import { z } from "zod";
import { EstadoReserva } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const result = await getReserva(id);

    if (result.error) {
      return NextResponse.json({ data: null, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ data: result.data, error: null }, { status: 200 });
  } catch {
    return NextResponse.json({ data: null, error: "Error interno del servidor" }, { status: 500 });
  }
}

const patchSchema = z.object({
  estado: z.nativeEnum(EstadoReserva),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    console.log("[PATCH /api/reserva/" + id + "] body recibido de Payments:", JSON.stringify(body));

    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      console.log("[PATCH /api/reserva/" + id + "] body inválido:", JSON.stringify(validation.error.flatten().fieldErrors));
      return NextResponse.json(
        { data: null, error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { estado } = validation.data;
    console.log("[PATCH /api/reserva/" + id + "] estado parseado:", estado);

    if (estado === EstadoReserva.Cancelada) {
      const result = await cancelarReserva(id);
      console.log("[PATCH /api/reserva/" + id + "] resultado de cancelarReserva:", JSON.stringify(result));
      if (result.error) {
        return NextResponse.json({ data: null, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ data: result.data, error: null }, { status: 200 });
    }
    if (estado === EstadoReserva.Coordinada) {
      const result = await coordinarReserva(id);
      if (result.error) {
        return NextResponse.json({ data: null, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ data: result.data, error: null }, { status: 200 });
    }

    const result = await actualizarEstadoReserva(id, estado);
    console.log("[PATCH /api/reserva/" + id + "] resultado de actualizarEstadoReserva:", JSON.stringify(result));
    if (result.error) {
      return NextResponse.json({ data: null, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ data: result.data, error: null }, { status: 200 });
  } catch {
    return NextResponse.json(
      { data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}