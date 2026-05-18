import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { onboardingSchema } from "@/lib/validators/propietario";
import { registrarPropietario } from "@/lib/services/propietario.service";


export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ data: null, error: "No autorizado" }, { status: 401 });
    }

    const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
    
    // Si ya tiene rol y no es propietario → no puede hacer onboarding
    if (metadata?.role && metadata.role !== "propietario") {
      return NextResponse.json({ data: null, error: "No autorizado" }, { status: 403 });
    }

    if (metadata?.id_propietario) {
      return NextResponse.json(
        {
          data: { id_propietario: metadata.id_propietario, alreadyCompleted: true },
          error: null,
        },
        { status: 200 }
      );
    }

    const body = await req.json();
    const validation = onboardingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { nombre, apellido, fecha_nacimiento, dni, direccion } = validation.data;

    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ data: null, error: "No se encontró el email del usuario" }, { status: 400 });
    }

    const result = await registrarPropietario(email, validation.data);
    const propietario = result.data;

    await (await clerkClient()).users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "propietario",
        id_propietario: propietario.id_propietario,
      },
    });

    return NextResponse.json({ data: { id_propietario: propietario.id_propietario }, error: null }, { status: 201 });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const target = error.meta?.target;
        const campo = Array.isArray(target) ? target[0] : String(target ?? 'campo');
        
        let mensaje = `Ya existe un propietario con ese ${campo}`;
        if (campo === 'email') mensaje = "Ya existe un propietario con ese email";
        if (campo === 'dni') mensaje = "Ya existe un propietario con ese DNI";
        
        return NextResponse.json({ 
          data: null, 
          error: mensaje 
        }, { status: 400 });
      }
      console.error("Error en /api/onboarding:", error);
      return NextResponse.json({ data: null, error: "Error interno del servidor" }, { status: 500 });
    }
}