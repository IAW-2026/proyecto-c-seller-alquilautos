import { auth } from "@clerk/nextjs/server";
import { PropietarioLayoutClient } from "@/components/features/layout/PropietarioLayoutClient";
import { getPendientesUrgentesCount } from "@/lib/services/reserva.service";

export default async function PropietarioLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  const isAdminSeller = metadata?.role === "adminSeller";

  const pendientesUrgentes = metadata?.id_propietario
    ? (await getPendientesUrgentesCount(metadata.id_propietario)).data?.count ?? 0
    : 0;

  return (
    <PropietarioLayoutClient isAdminSeller={isAdminSeller} pendientesUrgentes={pendientesUrgentes}>
      {children}
    </PropietarioLayoutClient>
  );
}