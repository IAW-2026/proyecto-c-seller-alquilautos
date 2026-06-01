import { auth } from "@clerk/nextjs/server";
import { PropietarioLayoutClient } from "@/components/features/layout/PropietarioLayoutClient";

export default async function PropietarioLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  const isAdminSeller = role === "adminSeller";

  return (
    <PropietarioLayoutClient isAdminSeller={isAdminSeller}>
      {children}
    </PropietarioLayoutClient>
  );
}