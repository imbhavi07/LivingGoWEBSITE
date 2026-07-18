import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { signJwt } from "../utils/jwt";
import { VISIT_CONFIG } from "../config/visit.config";
import { sendWhatsAppMessage } from "../services/whatsapp.service";
import { Role } from "@prisma/client";
import type { InternRequest } from "../middleware/intern.middleware";
const resend = new Resend(process.env.RESEND_API_KEY);

const SUPERVISOR_EMAILS = [
  "mffalit@gmail.com",
  "semwalb3@gmail.com",
  "rctaccommodations@gmail.com",
];

// Validation schema for visit scheduling
const scheduleVisitSchema = z.object({
  visitDate: z.string().datetime(),
  timeSlot: z.string().min(1, "Time slot is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  couponCode: z.string().optional().nullable(),
  // FIXED: Removed the double backslash
  whatsappNumber: z.string().regex(/^\+91[0-9]{10}$/, "Invalid WhatsApp number format. Please enter a valid Indian mobile number starting with +91 followed by 10 digits."),
});

// Helper function to generate a random 6-character alphanumeric string
function generateTokenId(): string {
  const randomBytes = crypto.randomBytes(3);
  const hexString = randomBytes.toString("hex").toUpperCase();
  return `VISIT-${hexString}`;
}

function generateVisitOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Helper function to validate time slot format and range
function isValidTimeSlot(timeSlot: string): boolean {
  // Expected format: "HH:MM AM/PM - HH:MM AM/PM" (e.g., "09:20 AM - 09:40 AM")
  // Convert to uppercase to allow lowercase am/pm
  const upperTimeSlot = timeSlot.toUpperCase();
  const timeSlotRegex = /^(\d{2}):(\d{2}) (AM|PM) - (\d{2}):(\d{2}) (AM|PM)$/;
  const match = upperTimeSlot.match(timeSlotRegex);

  if (!match) return false;

  const [, startHourStr, startMinStr, startPeriod, endHourStr, endMinStr, endPeriod] = match;

  const startHour = parseInt(startHourStr, 10);
  const startMin = parseInt(startMinStr, 10);
  const endHour = parseInt(endHourStr, 10);
  const endMin = parseInt(endMinStr, 10);

  // Convert to 24-hour format for easier comparison
  let startHour24 = startHour;
  let endHour24 = endHour;

  if (startPeriod === "PM" && startHour !== 12) startHour24 = startHour + 12;
  if (startPeriod === "AM" && startHour === 12) startHour24 = 0;

  if (endPeriod === "PM" && endHour !== 12) endHour24 = endHour + 12;
  if (endPeriod === "AM" && endHour === 12) endHour24 = 0;

  // Validate time range: 8:00 AM to 8:00 PM (08:00 to 20:00 in 24-hour format)
  const startTimeInMinutes = startHour24 * 60 + startMin;
  const endTimeInMinutes = endHour24 * 60 + endMin;

  const minTime = 8 * 60; // 8:00 AM = 480 minutes
  const maxTime = 22 * 60; // 8:00 PM = 1200 minutes

  // Check if within valid hours
  if (startTimeInMinutes < minTime || endTimeInMinutes > maxTime) {
    return false;
  }

  // Check if it's exactly 20 minutes duration
  const duration = endTimeInMinutes - startTimeInMinutes;
  if (duration !== 20) {
    return false;
  }

  // Check if start time is on a 20-minute boundary (0, 20, 40 minutes past the hour)
  if (startMin % 20 !== 0) {
    return false;
  }

  return true;
}

// Helper function to validate that a date is in the future
function isFutureDate(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const now = new Date();

  // Clear time part for date-only comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const inputDateStart = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    0, 0, 0, 0
  );

  return inputDateStart >= todayStart;
}

export const scheduleVisit = asyncHandler(
  async (request: Request, response: Response, next: NextFunction) => {
    let validatedData;
    try {
      validatedData = scheduleVisitSchema.parse(request.body);
    } catch (err) {
      console.log("REQUEST BODY:", request.body);
      console.log("ZOD ERROR:", err);
      throw err;
    }

    const { visitDate, timeSlot, propertyId, couponCode, whatsappNumber } = validatedData;
    console.log("========== SCHEDULE VISIT ==========");
    console.log(request.body);
    console.log("USER:", request.user);
    // Get user ID from request (set by clerkAuthenticate middleware)
    const userId = request.user?.id;

    if (!userId) {
      return next(new AppError("User not found", 404));
    }

    // Validate that visitDate is in the future
    if (!isFutureDate(visitDate)) {
      return next(new AppError("Visit date must be in the future", 400));
    }

    // Validate coupon / referral code if provided
    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();
    
      // 1. Check Admin Coupon
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: upperCode,
          isActive: true,
        },
      });
    
      if (coupon) {
        if (
          coupon.maxUses !== null &&
          coupon.currentUses >= coupon.maxUses
        ) {
          return next(
            new AppError(
              "Coupon has reached its maximum usage limit",
              400
            )
          );
        }
    } else {
    // 2. Check Partner Referral Code
    const referral = await prisma.referral.findFirst({
      where: {
        code: upperCode,
        status: "APPROVED",
      },
    });

    if (!referral) {
      return next(
        new AppError("Invalid or expired coupon code", 400)
      );
    }
      }
    }

    // Generate unique tokenId
    let tokenId = generateTokenId();
    let tokenExists = true;

    // Ensure tokenId is unique (very unlikely to collide, but let's be safe)
    while (tokenExists) {
      const existingVisit = await prisma.visit.findUnique({
        where: { tokenId },
      });

      if (!existingVisit) {
        tokenExists = false;
      } else {
        tokenId = generateTokenId(); // Generate a new one if collision occurs
      }
    }

    const existingVisit = await prisma.visit.findFirst({
      where: {
        studentId: userId,
        propertyId,
        visitDate: new Date(visitDate),
        timeSlot,
      },
    });

    if (existingVisit) {
      return next(
        new AppError(
          "You have already scheduled this visit.",
          400
        )
      );
    }
    const visit = await prisma.visit.create({
      data: {
        tokenId,
        studentId: userId,
        propertyId,
        visitDate: new Date(visitDate),
        timeSlot,
        visitOtp: generateVisitOtp(),
        couponCode: couponCode?.toUpperCase().trim() || null,
        whatsappNumber: whatsappNumber,
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
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

              owner: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
      });
    console.log("VISIT CREATED");
    console.log(visit);

    // Send WhatsApp notification
    try {
      const message = `Your LivingGo visit has been booked successfully!\n\nOTP: ${visit.visitOtp}\nToken ID: ${visit.tokenId}\n\nPlease share this OTP with the Live-in Guru when you meet them.`;
      await sendWhatsAppMessage(whatsappNumber, message);
    } catch (whatsappError) {
      console.error("Failed to send WhatsApp message:", whatsappError);
      // We don't want to fail the request if WhatsApp fails, so we just log the error.
    }

    // If a valid coupon code was provided, increment its usage count
    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();

      const coupon = await prisma.coupon.findUnique({
        where: {
          code: upperCode,
        },
      });
    
      if (coupon) {
        await prisma.coupon.update({
          where: {
            code: upperCode,
          },
          data: {
            currentUses: {
              increment: 1,
            },
          },
        });
      }
    }
  console.log("RETURNING SUCCESS");
  response.status(201).json({
    success: true,

    data: {
      visitId: visit.id,
      tokenId: visit.tokenId,
      visitOtp: visit.visitOtp,
      visitDate: visit.visitDate,
      timeSlot: visit.timeSlot,
      couponCode: visit.couponCode,
      status: visit.leadStatus,
      supervisor: VISIT_CONFIG.supervisor,
      student: visit.student,
      property: visit.property,
    },
  });
  }
);

export const sendSupervisorOtp = asyncHandler(
  async (request: Request, response: Response) => {

    const { email } = request.body as { email: string };

    if (!SUPERVISOR_EMAILS.includes(email.toLowerCase())) {
      throw new AppError(
        "Unauthorized supervisor email.",
        403
      );
    }

    const otp = crypto
      .randomInt(100000, 999999)
      .toString();

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await prisma.emailOtp.create({
      data: {
        email,
        codeHash: otpHash,
        purpose: "visiting_supervisor_login",
        expiresAt,
      },
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "LivingGo Visiting Supervisor OTP",

      html: `
      <div style="font-family:sans-serif">

      <h2>LivingGo Visiting Portal</h2>

      <p>Your OTP is</p>

      <h1>${otp}</h1>

      <p>
      Valid for 10 minutes.
      </p>

      </div>
      `,
    });

    response.json({
      success: true,
    });

  }
);

export const verifySupervisorOtp = asyncHandler(
  async (request: Request, response: Response) => {

    const { email, otp } = request.body;

    if (!SUPERVISOR_EMAILS.includes(email.toLowerCase())) {
      throw new AppError(
        "Unauthorized supervisor.",
        403
      );
    }

    const otpRecord =
      await prisma.emailOtp.findFirst({
        where: {
          email,
          purpose:
            "visiting_supervisor_login",
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!otpRecord) {
      throw new AppError(
        "OTP expired.",
        400
      );
    }

    const valid =
      await bcrypt.compare(
        otp,
        otpRecord.codeHash
      );

    if (!valid) {
      throw new AppError(
        "Invalid OTP.",
        400
      );
    }

    await prisma.emailOtp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const supervisor = await prisma.user.findUnique({
  where: {
    email,
  },
});

if (!supervisor) {
  throw new AppError("Supervisor account not found.", 404);
}

const token = signJwt({
  id: supervisor.id,
  email: supervisor.email,
  role: supervisor.role,
});
    response.json({
      success: true,
      token,
      supervisor: {
        id: supervisor.id,
        name: supervisor.name,
        email: supervisor.email,
        role: supervisor.role,
      },
    });
  }
);

export const getAllVisits = asyncHandler(
  async (_request: Request, response: Response) => {

    const visits = await prisma.visit.findMany({
      // Removed status filter to get all visits for admin dashboard
      // If we need to filter by status, we can add it as a query parameter later
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
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

            owner: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        intern: {
          select: {
            id: true,
            name: true,
            username: true,
            phone: true,
          },
        },
      },

      orderBy: [
        {
          visitDate: "asc",
        },
        {
          timeSlot: "asc",
        },
      ],
    });

    response.json({
      success: true,
      visits,
      total: visits.length,
    });

  }
);

export const assignLead = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { visitId } = req.params as { visitId: string };

      const visit = await prisma.visit.findUnique({
        where: {
          id: visitId,
        },
        include: {
          property: {
            include: {
              owner: true,
            },
          },
          student: true,
        },
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: "Visit not found",
        });
      }

      const { internId, meetingPointId } = req.body;

      const updatedVisit = await prisma.visit.update({
        where: {
          id: visitId,
        },
        data:{
          assignedLeadId:internId,
          meetingPointId,
          leadStatus:"ASSIGNED"
        }
      });

      return res.json({
        success: true,
        message: "Lead assigned successfully.",
        visit: updatedVisit,
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

      const interns = await prisma.intern.findMany({
        where: {
          supervisorId,
          active: true,
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

export const getAvailableInterns = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const visitId = Array.isArray(req.params.visitId) ? req.params.visitId[0] : req.params.visitId;

      const visit = await prisma.visit.findUnique({
        where: {
          id: visitId,
        },
        select: {
          visitDate: true,
          timeSlot: true,
        },
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: "Visit not found",
        });
      }

      const busyInterns = await prisma.visit.findMany({
        where: {
          visitDate: visit.visitDate,
          timeSlot: visit.timeSlot,
          leadStatus: {
            in: ["ASSIGNED", "MET"],
          },
          assignedLeadId: {
            not: null,
          },
        },
        select: {
          assignedLeadId: true,
        },
      });

      const busyIds = busyInterns
        .map(v => v.assignedLeadId!)
        .filter(Boolean);

      const interns = await prisma.intern.findMany({
        where: {
          active: true,
          id: {
            notIn: busyIds,
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.json({
        success: true,
        interns,
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

      const supervisorId = req.user!.id;

      const {
        name,
        phone,
        password
      } = req.body;

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
      console.log("Intern Dashboard Visits:");
      console.log(visits);
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
    req: Request & InternRequest,
    res: Response,
    _next: NextFunction
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

      if (!visit.visitOtpVerified) {
        return res.status(400).json({
            success:false,
            message:"Verify student OTP first."
        });
      }

      const updated = await prisma.visit.update({
        where: {
          id: visit.id,
        },
        data: {
          leadStatus: status,
        },
      });

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
 async (req: Request & InternRequest,res: Response)=>{

   const internId=req.intern!.id;
   const visitId = String(req.params.id);
   const {otp}=req.body;

   const visit=await prisma.visit.findFirst({
      where:{
         id:visitId,
         assignedLeadId:internId
      }
   });

   if(!visit){
      return res.status(404).json({
         success:false,
         message:"Visit not found"
      });
   }

   if(visit.visitOtp!==otp){
      return res.status(400).json({
         success:false,
         message:"Invalid OTP"
      });
   }

   await prisma.visit.update({
      where:{
         id:visit.id
      },
      data:{
         visitOtpVerified:true
      }
   });

   return res.json({
      success:true
   });

 });