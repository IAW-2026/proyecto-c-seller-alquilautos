import { SignUp } from "@clerk/nextjs";
import { AuthBackground } from "@/components/features/auth/AuthBackground";

export default function SignUpPage() {
  return (
    <AuthBackground>
      <SignUp />
    </AuthBackground>
  );
}
