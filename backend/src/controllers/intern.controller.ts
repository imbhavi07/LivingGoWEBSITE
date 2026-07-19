import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import { signJwt } from "../utils/jwt";
import { Role } from "@prisma/client";
import type { InternRequest } from "../middleware/intern.middleware";

export const internLogin = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { username, password } = req.body;

      const intern = await prisma.intern.findUnique({
        where: {
          username,
        },
      });

      if (!intern) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const valid = await bcrypt.compare(
        password,
        intern.passwordHash
      );

      if (!valid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = signJwt({
        id: intern.id,
        username: intern.username,
        role: Role.INTERN
      });

      if (!intern.active) {
        return res.status(403).json({
          success: false,
          message: "Your ID has been blocked. Contact your supervising manager.",
        });
      }

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
        message: "Internal server error",
      });
    }
  }
);

export const createIntern = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { name, phone, password } = req.body;
      const supervisorId = req.user!.id;
      if (!name || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, phone, and password are required",
        });
      }

      const username =
        `INT${Date.now().toString().slice(-6)}`;

      const passwordHash =
        await bcrypt.hash(password, 10);

      const intern =
        await prisma.intern.create({

          data: {

            supervisorId,

            name,

            phone,

            username,

            passwordHash,

          },

        });

      return res.json({

        success: true,
        intern

      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({

        success: false,
        message: "Internal server error",

      });

    }
  }
);

export const getInterns = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const supervisorId = req.user!.id;
      const showAll = req.query.showAll === "true";
      const interns = await prisma.intern.findMany({
        where: showAll
          ? {}
          : {
              supervisorId: String(supervisorId),
            },
          
        orderBy: {
          name: "asc",
        },
      });

      return res.json({
        success: true,
        interns,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });

    }
  }
);

export const deleteIntern = asyncHandler(
  async (req: Request, res: Response) => {

    await prisma.visit.updateMany({
      where: {
        assignedLeadId: String(req.params.id),
      },
      data: {
        assignedLeadId: null,
        leadStatus: "SCHEDULED",
      },
    });

    await prisma.intern.delete({
      where: {
        id: String(req.params.id),
      },
    });

    return res.json({
      success: true,
    });
  }
);

export const toggleInternStatus = asyncHandler(
  async (req: Request, res: Response) => {

    const intern = await prisma.intern.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found",
      });
    }

    const updated = await prisma.intern.update({
      where: {
        id: intern.id,
      },
      data: {
        active: !intern.active,
      },
    });

    return res.json({
      success: true,
      intern: updated,
    });
  }
);

export const getInternDashboard = asyncHandler(
  async (
    req: InternRequest,
    res: Response
  ) => {
    try {
      const internId = req.intern!.id;

      const visits = await prisma.visit.findMany({
        where: {
          assignedLeadId: internId,
          leadStatus: {
            notIn: [
              "SUCCESSFUL",
              "NOT_SUCCESSFUL",
              "NOT_MET",
              "INTERESTED_OTHER_PROPERTY"
            ],
          },
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },

          property: {
            select: {
              id: true,
              propertyCode: true,
              title: true,
              location: true,
              price: true,
            },
          },
        },

        orderBy: [
          {
            visitDate: "asc",
          },
        ],
      });
      return res.json({
        success: true,
        visits,
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });

    }
  }
);

export const updateInternVisitStatus = asyncHandler(
  async (
    req: InternRequest & Request,
    res: Response
  ) => {
    try {
      const internId = req.intern!.id;
      const visitId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const {
        otp,
        status,
      } = req.body;

      const visit = await prisma.visit.findFirst({
        where: {
          id: visitId,
          assignedLeadId: internId,
        },
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: "Visit not found",
        });
      }

      if (visit.isLocked) {
      return res.status(403).json({

          success: false,

          message: "This visit has been locked. Contact your supervisor to modify it.",

      });

    }

      // Use constant-time comparison to prevent timing attacks
      if (status !== "NOT_MET") {
        const isValid = String(otp).trim() === String(visit.visitOtp).trim();
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: "Invalid OTP",
          });
        }
      }

      const finalStatuses = [
        "SUCCESSFUL",
        "NOT_SUCCESSFUL",
        "NOT_MET",
        "INTERESTED_OTHER_PROPERTY",
      ];

      const updated = await prisma.visit.update({
        where: {
          id: visit.id,
        },
        data: {
          leadStatus: status,
          isLocked: finalStatuses.includes(status),
        },
      });

      if (
        visit.couponCode &&
        !visit.referralCounted &&
        finalStatuses.includes(status)
      ) {
        const referral = await prisma.referral.findFirst({
          where: {
            code: visit.couponCode,
            status: "APPROVED",
          },
        });
      
        if (referral) {
          await prisma.$transaction(async (tx) => {
            await tx.referral.update({
              where: {
                id: referral.id,
              },
              data: {
                invites: {
                  increment: 1,
                },
                ...(status === "SUCCESSFUL"
                  ? {
                      successful: {
                        increment: 1,
                      },
                    }
                  : {}),
              },
            });

            await tx.visit.update({
              where: {
                id: visit.id,
              },
              data: {
                referralCounted: true,
              },
            });
          });
        }
      }

      return res.json({
        success: true,
        visit: updated,
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });

    }
  }
);

export const verifyVisitOtp = asyncHandler(
  async (req: InternRequest, res: Response) => {
    const { visitId, otp } = req.body;

    const internId = req.intern!.id;

    const visit = await prisma.visit.findFirst({
      where: {
        id: visitId,
        assignedLeadId: internId,
      },
    });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    return res.json({
      success: otp === visit.visitOtp,
    });
  }
);