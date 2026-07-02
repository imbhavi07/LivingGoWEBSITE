import { Request, Response } from 'express';
// CHANGE THIS PATH to wherever you instantiated "export const prisma = new PrismaClient()"
import { PrismaClient } from '@prisma/client';

// Instantiate PrismaClient locally to avoid missing-module import errors
const prisma = new PrismaClient();

// Fix: Use a request type alias to avoid incompatible user property overrides
type AuthRequest = Request & { user?: { id: string } };

export const getEarnDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Now 'prisma' is the instance, so .referral will exist
    const referral = await (prisma as any).referral.findFirst({ 
        where: { userId: userId } 
    });
    
    res.json({
      hasRequestedCode: !!referral,
      referralData: referral ? {
        code: referral.code,
        status: referral.status, 
        discountValue: 100,
        discountType: 'FLAT'
      } : null,
      metrics: { totalInvites: 0, pendingBookings: 0, totalEarnings: 0 },
      history: []
    });
  } catch (error) {
    console.error("Earn Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};