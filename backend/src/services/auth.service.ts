import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { signJwt } from "../utils/jwt";

type SignupInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Exclude<Role, "admin">;
};

type LoginInput = {
  email: string;
  password: string;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true
};

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email is already registered", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role
    },
    select: userSelect
  });

  return {
    user,
    token: signJwt({ id: user.id, email: user.email, role: user.role })
  };
}

export async function login(input: LoginInput, allowedRoles?: Role[]) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError("Invalid email or password", 401);
  if (user.status === "suspended") throw new AppError("Account is suspended", 403);
  if (allowedRoles && !allowedRoles.includes(user.role)) throw new AppError("Forbidden", 403);

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) throw new AppError("Invalid email or password", 401);

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return {
    user: safeUser,
    token: signJwt({ id: user.id, email: user.email, role: user.role })
  };
}
