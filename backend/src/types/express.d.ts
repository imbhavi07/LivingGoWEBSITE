import type { Role, VerificationStatus } from "@prisma/client";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: Role;
      email: string;
      verificationStatus: VerificationStatus;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};