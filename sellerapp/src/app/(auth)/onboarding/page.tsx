import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/features/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  if (metadata?.id_propietario) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
      <div className="w-full max-w-[560px] px-4">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold m-0 text-[var(--text-primary)]">AlquilAutos</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Completá tu perfil para empezar a publicar vehículos
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}