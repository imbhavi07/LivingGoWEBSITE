import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

export const loginIntern = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, password } = req.body;
    console.log("USERNAME:", username);
    console.log("PASSWORD:", password);

    const intern = await prisma.intern.findUnique({
      where: {
        username,
      },
    });
    console.log("FOUND INTERN:", intern);

    if (!intern) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const valid = await bcrypt.compare(
      password,
      intern.passwordHash
    );
    console.log("PASSWORD VALID:", valid);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        id: intern.id,
        username: intern.username,
        role: "INTERN",
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      token,
      intern: {
        id: intern.id,
        name: intern.name,
        username: intern.username,
      },
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};