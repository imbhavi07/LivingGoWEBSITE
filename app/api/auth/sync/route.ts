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
    // Check if it's a database connection error
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("failed to connect") ||
        message.includes("connection refused") ||
        message.includes("connection timeout") ||
        message.includes("timeout")
      ) {
        return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
      }
      // Check for Prisma error codes related to connection issues
      if (
        (error as any).code &&
        ((error as any).code.startsWith('P10') || (error as any).code === 'P2024')
      ) {
        return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
      }
    }
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}