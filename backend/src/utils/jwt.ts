import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env";

type TokenPayload = {
  id: string;
  email: string;
  role: Role;
};

export function signJwt(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
