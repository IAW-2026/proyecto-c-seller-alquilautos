import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/",
  "/api/(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAdminRoute(request) && role !== "adminSeller") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute(request) && role !== "propietario") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};