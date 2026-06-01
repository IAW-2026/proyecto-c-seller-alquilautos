import { auth } from "@clerk/nextjs/server";
import { AdminLayoutClient } from "@/components/features/layout/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  const isAdminSeller = role === "adminSeller";

  return (
    <AdminLayoutClient isAdminSeller={isAdminSeller}>
      {children}
    </AdminLayoutClient>
  );
}