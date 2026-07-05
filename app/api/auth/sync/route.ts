import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // We now extract the intended role from the request body
    const { userId, email, name, intendedRole } = await req.json();

    // STRICT VALIDATION: If it's not explicitly 'owner', force it to 'student'
    const safeRole = intendedRole === 'owner' ? 'owner' : 'student';

    // 1. Save to Prisma Database dynamically
    const newUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        role: safeRole,
      },
      create: {
        id: userId,
        email: email,
        name: name || "User",
        role: safeRole,
        passwordHash: "",
      }
    });

    // 2. Sync Clerk's Metadata dynamically
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: safeRole
      }
    });

    return NextResponse.json({ success: true, user: newUser });
    
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}