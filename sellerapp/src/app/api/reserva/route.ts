import { NextResponse } from "next/server";
import { crearReserva } from "@/lib/services/reserva.service";
import { crearReservaSchema } from "@/lib/validators/reserva";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = crearReservaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { data: null, error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await crearReserva(validation.data);

    if (result.error) {
      return NextResponse.json({ data: null, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ data: result.data, error: null }, { status: 201 });
  } catch {
    return NextResponse.json({ data: null, error: "Error interno del servidor" }, { status: 500 });
  }
}