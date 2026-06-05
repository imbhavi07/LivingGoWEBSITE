import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/owner/login(.*)",
  "/owner/signup(.*)",
  "/owner/kyc(.*)",
  "/listings(.*)",
  "/properties(.*)",
  "/legal(.*)",
  "/api/auth(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Admin — keep bypass for now
  if (pathname.startsWith("/admin")) return NextResponse.next();

  // Public routes — always allow
  if (isPublicRoute(request)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();

  // Not signed in — redirect to appropriate login
  if (!userId) {
    if (pathname.startsWith("/owner")) {
      const loginUrl = new URL("/owner/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  // Owner routes — must have owner or admin role
  if (pathname.startsWith("/owner")) {
    if (role !== "owner" && role !== "admin") {
      return NextResponse.redirect(new URL("/owner/login", request.url));
    }
    return NextResponse.next();
  }

  // Student routes — must have student role
  if (role === "owner") {
    // Owner trying to access student area — redirect to owner dashboard
    return NextResponse.redirect(new URL("/owner/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};