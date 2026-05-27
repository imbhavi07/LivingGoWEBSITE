import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/owner/login(.*)",
  "/owner/signup(.*)",
  "/owner/kyc(.*)",
  "/admin/login(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/listings(.*)",
  "/properties(.*)",
  "/legal(.*)",
  "/api/auth(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isOwnerRoute = createRouteMatcher(["/owner(.*)"]);
const isNewPropertyRoute = createRouteMatcher(["/owner/properties/new(.*)"]);
const isKycRoute = createRouteMatcher(["/owner/kyc(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;

  if (isPublicRoute(request)) return NextResponse.next();

  if (!userId) {
    const loginUrl = new URL(
      isAdminRoute(request) ? "/admin/login" :
      isOwnerRoute(request) ? "/owner/login" : "/login",
      request.url
    );
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = request.cookies.get("LivingGo_role")?.value;
  const verificationStatus = request.cookies.get("LivingGo_verification")?.value;

  if (isAdminRoute(request) && role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isOwnerRoute(request) && role && role !== "owner" && role !== "admin") {
    return NextResponse.redirect(new URL("/owner/login", request.url));
  }

  if (isKycRoute(request)) return NextResponse.next();

  if (isNewPropertyRoute(request) && verificationStatus && verificationStatus !== "approved") {
    return NextResponse.redirect(new URL("/owner/kyc", request.url));
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