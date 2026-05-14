import { NextResponse } from "next/server";
import { crearVehiculo } from "@/lib/services/vehiculo.service";
import { crearVehiculoSchema } from "@/lib/validators/vehiculo";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
    }

    const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };

    if (metadata?.role !== "propietario") {
    return NextResponse.json({ data: null, error: "No autorizado" }, { status: 403 });
    }

    const id_propietario = metadata?.id_propietario;
    if (!id_propietario) {
    return NextResponse.json({ data: null, error: "Propietario no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const validation = crearVehiculoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await crearVehiculo(id_propietario, validation.data);
    if (result.error) {
      return NextResponse.json({ data: null, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data, error: null }, { status: 201 });
  } catch {
    return NextResponse.json({ data: null, error: "Error interno del servidor" }, { status: 500 });
  }
}