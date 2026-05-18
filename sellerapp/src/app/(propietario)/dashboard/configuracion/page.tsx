import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPropietario } from "@/lib/services/propietario.service";
import { ConfiguracionForm } from "@/components/features/configuracion/ConfiguracionForm";

export default async function ConfiguracionPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const result = await getPropietario(id_propietario);
  if (result.error || !result.data) redirect("/dashboard");

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header">
        <div>
          <h2>Configuración</h2>
          <div className="sub">Tus datos personales en AlquilAutos</div>
        </div>
      </div>
      <ConfiguracionForm propietario={result.data} />
    </div>
  );
}