import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, propertyId } = await req.json();
    const { userId, getToken } = await auth();

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Cryptographically verify the payment actually succeeded
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Securely call the Express Backend to instantly lock the property
    const token = await getToken();
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token-payments/confirm-razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Pass the Clerk token for security
      },
      body: JSON.stringify({ propertyId, razorpayPaymentId: razorpay_payment_id }),
    });

    if (!backendRes.ok) {
        const errData = await backendRes.json();
        throw new Error(errData.message || "Backend failed to lock property");
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}

