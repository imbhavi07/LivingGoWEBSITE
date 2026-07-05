import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ totalListings: 0, activeListings: 0, pendingListings: 0 }, { status: 401 });
    }

    // Fetch all properties for this owner
    const properties = await prisma.property.findMany({
      where: { ownerId: userId },
      select: { status: true }
    });

    const totalListings = properties.length;
    
// Convert Prisma status strings to counts
    // Compare using a string array to avoid strict union type mismatch from Prisma
    const activeListings = properties.filter((p: { status: string }) => ['approved', 'active'].includes(p.status)).length;
    const pendingListings = properties.filter((p: { status: string }) => p.status === 'pending').length;

    return NextResponse.json({
      totalListings,
      activeListings,
      pendingListings
    });
    
  } catch (error) {
    console.error("Error fetching owner stats:", error);
    return NextResponse.json({ totalListings: 0, activeListings: 0, pendingListings: 0 });
  }
}
