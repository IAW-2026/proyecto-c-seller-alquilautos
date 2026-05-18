import { NextResponse } from "next/server";
import { getPropietario, actualizarPropietario  } from "@/lib/services/propietario.service";
import { actualizarPropietarioSchema } from "@/lib/validators/propietario";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getPropietario(id);

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

    const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
    if (metadata?.id_propietario !== (await params).id) {
      return NextResponse.json({ data: null, error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = actualizarPropietarioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await actualizarPropietario(id, validation.data);
    if (result.error) {
      return NextResponse.json({ data: null, error: result.error }, { status: 404 });
    }

    if (validation.data.email) {
      await (await clerkClient()).users.updateUser(userId, {
        primaryEmailAddressID: undefined,
      });
    }

    return NextResponse.json({ data: result.data, error: null }, { status: 200 });
  } catch {
    return NextResponse.json({ data: null, error: "Error interno del servidor" }, { status: 500 });
  }
}