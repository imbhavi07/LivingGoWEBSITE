import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env";

type TokenPayload = {
  id: string;
  email: string;
  role: Role;
};

export function signJwt(payload: TokenPayload) {
  // With token expiry
  // return jwt.sign(payload, env.JWT_SECRET as Secret, {
  //   expiresIn: env.JWT_EXPIRES_IN,
  // } as SignOptions);

  // Without token expiry
  return jwt.sign(payload, env.JWT_SECRET as Secret);
}

export function verifyJwt(token: string) {
  return jwt.verify(token, env.JWT_SECRET as Secret) as TokenPayload;
}