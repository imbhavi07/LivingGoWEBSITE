import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json([]);
    }

    // A tenant is someone who paid the token, got approved, AND had their visit verified by the owner via OTP
    const tenants = await prisma.tokenPayment.findMany({
      where: {
        property: { ownerId: userId },
        status: 'approved',
        visitVerified: true
      },
      include: {
        student: {
          select: { name: true, email: true }
        },
        property: {
          select: { title: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(tenants);
    
  } catch (error) {
    console.error("Error fetching owner tenants:", error);
    return NextResponse.json([]);
  }
}