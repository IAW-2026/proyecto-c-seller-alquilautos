import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

  // Rutas públicas → dejar pasar siempre
  if (isPublicRoute(request)) return NextResponse.next();

  // No logueado → sign-in
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Logueado sin rol → onboarding
  if (!role && !id_propietario && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Raíz → redirigir según rol
  if (pathname === "/") {
    if (role === "adminSeller") return NextResponse.redirect(new URL("/admin", request.url));
    if (role === "propietario") return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Admin route → solo adminSeller
  if (isAdminRoute(request) && role !== "adminSeller") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Dashboard route → solo propietario
  if (isDashboardRoute(request) && role !== "propietario") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};