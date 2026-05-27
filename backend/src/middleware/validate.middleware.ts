import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

export function validate(schema: AnyZodObject) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: request.body,
      query: request.query,
      params: request.params
    });
    request.body = parsed.body ?? request.body;
    request.query = parsed.query ?? request.query;
    request.params = parsed.params ?? request.params;
    next();
  };
}
