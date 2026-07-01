import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// This route is a thin Backend-for-Frontend proxy — it never talks to
// Postgres directly. It exists so the browser only ever calls same-origin
// `/api/...` paths (simpler CORS/cookie story), while the actual dashboard
// aggregation logic (funnel counts, ledger, balances) lives once, in the
// Express backend at GET /api/affiliate/me/dashboard.
//
// Auth flow: Clerk session cookie (already on the request) -> auth() reads
// it server-side -> we mint a short-lived bearer token via getToken() and
// forward it to Express, which verifies it with Clerk's middleware. The
// browser never sees or handles this token directly.

export const dynamic = "force-dynamic"; // always fetch fresh balances, never cache

export async function GET() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED", message: "Sign in required." },
      { status: 401 }
    );
  }

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    console.error("BACKEND_API_URL is not set");
    return NextResponse.json(
      { error: "SERVER_MISCONFIGURED", message: "Dashboard service is unavailable." },
      { status: 500 }
    );
  }

  const token = await getToken();

  let upstream: Response;
  try {
    upstream = await fetch(`${backendUrl}/api/affiliate/me/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch (err) {
    console.error("Failed to reach backend dashboard endpoint:", err);
    return NextResponse.json(
      { error: "UPSTREAM_UNREACHABLE", message: "Couldn't load your dashboard right now." },
      { status: 502 }
    );
  }

  // Pass through the backend's status + body as-is (401/403/404/200 all carry
  // meaningful, already-shaped payloads the frontend already knows how to
  // render — e.g. 404 -> "You're not registered yet" empty state).
  const body = await upstream.json().catch(() => ({}));
  return NextResponse.json(body, { status: upstream.status });
}