import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { createClerkClient } from "@clerk/backend";

export async function getPendingOwnerApprovals() {
  return prisma.user.findMany({
    where: { role: "owner", verificationStatus: "pending_approval" },
    select: {
      id: true, name: true, email: true, phone: true,
      ownerType: true, aadhaarFrontUrl: true, aadhaarBackUrl: true,
      aadhaarNumber: true, legalAcceptedAt: true, verificationStatus: true, createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPendingOwnerApprovalById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, role: "owner" },
    select: {
      id: true, name: true, email: true, phone: true,
      ownerType: true, aadhaarFrontUrl: true, aadhaarBackUrl: true,
      aadhaarNumber: true, legalAcceptedAt: true, verificationStatus: true, createdAt: true
    }
  });
  if (!user) throw new AppError("Owner application not found", 404);
  return user;
}

export async function reviewOwnerApproval(id: string, status: "approved" | "rejected") {
  const user = await prisma.user.findFirst({
    where: { id, role: "owner" }
  });
  if (!user) throw new AppError("Owner application not found", 404);

  const updated = await prisma.user.update({
    where: { id },
    data: { verificationStatus: status, reviewedAt: new Date() },
    select: {
      id: true, name: true, email: true, phone: true,
      ownerType: true, aadhaarFrontUrl: true, aadhaarBackUrl: true,
      aadhaarNumber: true, legalAcceptedAt: true, verificationStatus: true, createdAt: true
    }
  });

  try {
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [user.email] });
    const clerkUser = clerkUsers.data[0];
    if (clerkUser) {
      await clerkClient.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: { role: "owner", verificationStatus: status },
      });
    }
  } catch (err) {
    console.error("Failed to update Clerk metadata:", err);
  }

  return updated;
}