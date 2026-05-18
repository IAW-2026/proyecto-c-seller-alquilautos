import { NextResponse } from "next/server";
import { getReserva, actualizarEstadoReserva   } from "@/lib/services/reserva.service";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
    }

    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "propietario") {
      return NextResponse.json({ data: null, error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const schema = z.object({
      estado: z.enum(["Aceptada", "Rechazada"]),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await actualizarEstadoReserva(id, validation.data.estado);
    if (result.error) {
      return NextResponse.json({ data: null, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ data: result.data, error: null }, { status: 200 });
  } catch {
    return NextResponse.json({ data: null, error: "Error interno del servidor" }, { status: 500 });
  }
}