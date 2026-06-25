import { auth } from "@clerk/nextjs/server";
import { AdminLayoutClient } from "@/components/features/layout/AdminLayoutClient";
import { isAdminRole } from "@/lib/auth/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  // Solo mostramos la navegación de propietario (con el panel admin como submenú) si el admin
  // también tiene su propia flota. Un admin "puro" (ej: la cuenta de Analytics App) ve el panel admin directo.
  const isAdminSeller = isAdminRole(metadata?.role) && Boolean(metadata?.id_propietario);

  return (
    <AdminLayoutClient isAdminSeller={isAdminSeller}>
      {children}
    </AdminLayoutClient>
  );
}