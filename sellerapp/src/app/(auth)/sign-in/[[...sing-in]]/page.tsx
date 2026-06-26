import { SignIn } from "@clerk/nextjs";
import { AuthBackground } from "@/components/features/auth/AuthBackground";

export default function SignInPage() {
  return (
    <AuthBackground>
      <SignIn />
    </AuthBackground>
  );
}
