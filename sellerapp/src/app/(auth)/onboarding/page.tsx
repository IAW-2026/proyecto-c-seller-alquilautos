import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/features/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) redirect("/sign-in");

  const metadata = sessionClaims?.publicMetadata as { 
    role?: string; 
    id_propietario?: string 
  };

  if (metadata?.id_propietario) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-page)" }}>
      <div style={{ width: "100%", maxWidth: 560, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>AlquilAutos</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
            Completá tu perfil para empezar a publicar vehículos
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}