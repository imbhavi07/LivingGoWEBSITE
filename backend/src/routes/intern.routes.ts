import { Router } from "express";
import * as internController from "../controllers/intern.controller";

export const internRouter = Router();

internRouter.post(
  "/login",
  internController.internLogin
);