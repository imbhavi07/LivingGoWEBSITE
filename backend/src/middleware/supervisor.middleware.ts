import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { verifyJwt } from "../utils/jwt";

import { AppError } from "../utils/app-error";

export interface SupervisorRequest
  extends Request {

  supervisor?: {
    id: string;
    email: string;
    role: string;
  };

}

export function supervisorAuthenticate(
  request: Request,
  _response: Response,
  next: NextFunction
) {

  try {

    const auth =
      request.headers.authorization;

    if (
      !auth ||
      !auth.startsWith("Bearer ")
    ) {
      throw new AppError(
        "Unauthorized",
        401
      );
    }

    const token =
      auth.substring(7);

    const payload =
      verifyJwt(token);

    (request as any).user = payload;
    console.log("JWT Payload:", payload);
    console.log("Request User:", (request as any).user);

    next();

  } catch {

    next(
      new AppError(
        "Unauthorized",
        401
      )
    );

  }

}