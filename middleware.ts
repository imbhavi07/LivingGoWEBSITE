import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/listings(.*)",
  "/properties(.*)",
  "/legal(.*)",
  "/api/auth(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Admin — custom JWT, Clerk bypass
  if (pathname.startsWith("/admin")) return NextResponse.next();

  // Owner — custom JWT, Clerk bypass
  if (pathname.startsWith("/owner")) {
    const token = request.cookies.get("LivingGo_token")?.value;
    const role = request.cookies.get("LivingGo_role")?.value;

    // Login/signup/kyc always allow
    if (
      pathname.startsWith("/owner/login") ||
      pathname.startsWith("/owner/signup") ||
      pathname.startsWith("/owner/kyc")
    ) return NextResponse.next();

    // Protected owner pages — token check
    if (!token) {
      const loginUrl = new URL("/owner/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Wrong role check
    if (role && role !== "owner" && role !== "admin") {
      return NextResponse.redirect(new URL("/owner/login", request.url));
    }

    // KYC check
    if (pathname.startsWith("/owner/properties/new")) {
      const verificationStatus = request.cookies.get("LivingGo_verification")?.value;
      if (verificationStatus && verificationStatus !== "approved") {
        return NextResponse.redirect(new URL("/owner/kyc", request.url));
      }
    }

    return NextResponse.next();
  }

  // Student routes — Clerk check
  const { userId } = await auth();
  if (isPublicRoute(request)) return NextResponse.next();

  if (!userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
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