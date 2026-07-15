import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 🚨 REMOVED PrismaClient import because Prisma crashes Next.js Edge Middleware!

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/visiting(.*)",
  "/owner/login(.*)",
  "/owner/signup(.*)",
  "/owner/kyc(.*)",
  "/listings(.*)",
  "/properties(.*)",
  "/legal(.*)",
  "/api/auth(.*)",
  "/api/webhooks(.*)",
  "/earn",
  "/api/earn/public(.*)",
  "/api/earn/track(.*)",
  "/about(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Maintenance mode check
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;

  // Allow access to the maintenance page itself, API routes, and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/maintenance' ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  if (isMaintenanceMode) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // Admin — keep bypass for now
  if (pathname.startsWith("/admin")) return NextResponse.next();

  // Public routes — always allow
  if (isPublicRoute(request)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  // Fixed the console log to use the lowercase 'role' variable
  console.log("[MIDDLEWARE HIT]:", pathname, "| Role:", role);

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

  // Owner routes — must have owner or admin role
  if (pathname.startsWith("/owner")) {

    // 👇 THIS IS THE CORRECT PLACE FOR THE SYNC BYPASS 👇
    if (pathname.startsWith("/owner/sync")) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/owner/kyc") && !role) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/owner/properties") && !role) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/owner/dashboard")) {
      return NextResponse.next();
    }

    // For other owner routes, require owner or admin role
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
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|manifest\\.json|service-worker\\.js).*)',
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};