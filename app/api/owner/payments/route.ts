import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payments = await prisma.tokenPayment.findMany({
      where: {
        property: {
          ownerId: userId,
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