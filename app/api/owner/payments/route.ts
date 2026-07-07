import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Find the internal User record using the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId }
    });

    if (!user) {
      // If the user isn't fully synced in the DB yet, they have no properties/payments
      return NextResponse.json([], { status: 200 });
    }

    // 2. Fetch payments for properties owned by this internal User ID (cuid)
    const payments = await prisma.tokenPayment.findMany({
      where: {
        property: {
          ownerId: user.id, // Use the internal user ID (cuid), not the Clerk ID
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            images: {
              select: {
                url: true,
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching owner token payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
