import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminRole } from "@/lib/auth/roles";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  const role = metadata?.role;
  const id_propietario = metadata?.id_propietario;
  const pathname = request.nextUrl.pathname;

  if (isPublicRoute(request)) return NextResponse.next();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const esAdmin = isAdminRole(role);

  // Las cuentas admin (adminSeller/adminGlobal) no necesariamente tienen un propietario
  // asociado (ej: la cuenta de Analytics App), así que no pasan por el onboarding de propietario.
  if (!id_propietario && !esAdmin && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(esAdmin && !id_propietario ? "/admin" : "/dashboard", request.url));
  }

  if (isAdminRoute(request) && !esAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute(request) && role !== "propietario" && !(esAdmin && id_propietario)) {
    return NextResponse.redirect(new URL(esAdmin ? "/admin" : "/sign-in", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};