import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Extract user data from Clerk webhook
    const { userId, email, name, intendedRole } = await req.json();

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: userId and email" },
        { status: 400 }
      );
    }

    // STRICT VALIDATION: If it's not explicitly 'owner', force it to 'student'
    const safeRole = intendedRole === 'owner' ? 'owner' : 'student';

    try {
      // First, try to find the user by email OR clerkId (userId)
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { id: userId }, // Clerk user ID
            { clerkId: userId } // Clerk ID stored in our DB
          ]
        }
      });

      let user;
      let isNewUser = false;

      if (existingUser) {
        // User exists - check if we need to update clerkId or id
        const needsUpdate =
          existingUser.clerkId !== userId ||
          existingUser.id !== userId;

        if (needsUpdate) {
          // Update the existing user with correct Clerk ID and/or internal ID
          user = await prisma.user.update({
            where: { id: existingUser.id }, // Use existing internal ID for update
            data: {
              id: userId, // Ensure internal ID matches Clerk ID
              clerkId: userId, // Ensure clerkId matches Clerk ID
              email: email,
              name: name || existingUser.name || "User",
              role: safeRole,
              passwordHash: existingUser.passwordHash || "" // Preserve existing password hash
            }
          });
        } else {
          // No update needed for IDs, but update other fields if they changed
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              email: email,
              name: name || existingUser.name || "User",
              role: safeRole
            }
          });
        }
      } else {
        // No existing user found - create new one
        user = await prisma.user.create({
          data: {
            id: userId,
            clerkId: userId,
            email: email,
            name: name || "User",
            role: safeRole,
            passwordHash: "" // Empty password hash for Clerk-authenticated users
          }
        });
        isNewUser = true;
      }

      // Sync Clerk's Metadata dynamically
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: safeRole
        }
      });

      return NextResponse.json({
        success: true,
        user: user,
        isNewUser: isNewUser
      });

    } catch (dbError) {
      // Handle database-specific errors gracefully
      console.error("Database error in auth/sync:", dbError);

      // Log the specific error for debugging
      if (dbError instanceof Error) {
        console.error("Database error details:", {
          message: dbError.message,
          code: (dbError as any).code,
          stack: dbError.stack
        });
      }

      // Return a graceful response instead of 500 error
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email,
          name: name || "User",
          role: safeRole
        },
        isNewUser: true,
        warning: "Database synchronization issue - user data may be temporarily inconsistent"
      });
    }

  } catch (error) {
    // Handle general errors (JSON parsing, etc.)
    console.error("Error in auth/sync endpoint:", error);

    // Return a graceful response instead of 500 error
    return NextResponse.json({
      success: true,
      user: {
        id: "unknown",
        email: "unknown",
        name: "User",
        role: "student"
      },
      isNewUser: true,
      warning: "Unable to process user data - using fallback values"
    });
  }
}