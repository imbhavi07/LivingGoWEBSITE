import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: Role;
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
