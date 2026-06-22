import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Lazily create the Razorpay client INSIDE the handler.
// Creating it at module scope causes Next.js to crash the build
// during "Collecting page data" if env vars aren't present at build time.
function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function POST(request: Request) {
  try {
    const { propertyId, amount } = (await request.json()) as {
      propertyId: string;
      amount: number;
    };

    if (!propertyId || !amount) {
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    // Check if Razorpay secret is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Server misconfiguration: Missing Razorpay keys" },
        { status: 500 }
      );
    }

    // Calculate payouts. For now, we are not splitting payments.
    // The entire amount goes to the platform (LivingGo).
    // The platform will then settle the amount to the owner via internal processes.
    const totalAmountInPaisa = Math.round(Number(amount) * 100);

    // Create the order options
    const orderOptions = {
      amount: totalAmountInPaisa,
      currency: "INR",
      receipt: `receipt_prop_${propertyId.substring(0, 10)}`,
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(orderOptions);

    // Return the generated order ID back to your LockPropertyModal component
    return NextResponse.json({ id: order.id });

  } catch (error: unknown) {
    console.error("Razorpay Order Creation Failure:", error);
    // Return actual error details for debugging, but in production you might want to hide them
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as Error).message)
          : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}