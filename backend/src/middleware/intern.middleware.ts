import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface InternRequest extends Request {
  intern?: {
    id: string;
    phone: string;
    role: string;
  };
}

export function internAuthenticate(
  req: InternRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const auth = req.headers.authorization;

    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = auth.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: string;
      phone: string;
      role: string;
    };

    if (decoded.role !== "INTERN") {
      return res.status(401).json({
        success: false,
        message: "Invalid role",
      });
    }

    req.intern = decoded;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}