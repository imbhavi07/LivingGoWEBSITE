import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ totalListings: 0, activeListings: 0, pendingListings: 0 }, { status: 401 });
    }

    // 1. Find the internal User record
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId }
    });

    if (!user) {
      return NextResponse.json({ totalListings: 0, activeListings: 0, pendingListings: 0 }, { status: 200 });
    }

    // 2. Fetch properties using the INTERNAL user.id
    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      select: { status: true }
    });

    const totalListings = properties.length;
    const activeListings = properties.filter((p: { status: string }) => ['approved', 'active'].includes(p.status)).length;
    const pendingListings = properties.filter((p: { status: string }) => p.status === 'pending').length;

    return NextResponse.json({
      totalListings,
      activeListings,
      pendingListings,
    });
  } catch (error) {
    console.error("🚨 Error fetching owner stats:", error);
    return NextResponse.json({ totalListings: 0, activeListings: 0, pendingListings: 0 });
  }
}
