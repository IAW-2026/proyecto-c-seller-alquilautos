import { NextResponse } from "next/server";
import { getVehiculo, actualizarVehiculo } from "@/lib/services/vehiculo.service";
import { actualizarVehiculoSchema } from "@/lib/validators/vehiculo";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getVehiculo(id);

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
    const validation = actualizarVehiculoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await actualizarVehiculo(id, validation.data);
    if (result.error) {
      return NextResponse.json({ data: null, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ data: result.data, error: null }, { status: 200 });
  } catch {
    return NextResponse.json({ data: null, error: "Error interno del servidor" }, { status: 500 });
  }
}