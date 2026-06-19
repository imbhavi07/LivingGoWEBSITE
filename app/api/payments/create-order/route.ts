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

    // ── DATABASE LOOKUP ───────────────────────────────────────────────────
    // TODO: Fetch your actual property record from your DB using your ORM/backend files
    // You need to get the owner's Razorpay Account ID (e.g., acc_Njk1M2JkaWZ...)
    // const property = await db.property.findUnique({ where: { id: propertyId } });
    // const landlordLinkedAccountId = property.owner.razorpayAccountId;

    // For now, let's mock it so your code runs instantly without breaking:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const landlordLinkedAccountId = "acc_MOCK_ACCOUNT_ID_123";
    // ───────────────────────────────────────────────────────────────────────

    // Calculate payouts. E.g., if total token amount is ₹7,500:
    // Suppose LivingGo takes a flat platform fee of ₹500, and Landlord gets ₹7,000.
    const platformFee = 500;
    const landlordPayoutAmount = amount - platformFee;

    // Razorpay works strictly in subunit Paisa (1 Rupee = 100 Paisa)
    const totalAmountInPaisa = amount * 100;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const landlordAmountInPaisa = landlordPayoutAmount * 100;

    // Create the order options with Razorpay Route split rules
    const orderOptions = {
      amount: totalAmountInPaisa,
      currency: "INR",
      receipt: `receipt_prop_${propertyId.substring(0, 10)}`,

      // Temporarily commented out until you create a real Linked Account in Razorpay
      /*
      transfers: [
        {
          account: landlordLinkedAccountId,
          amount: landlordAmountInPaisa,
          currency: "INR",
          notes: {
            info: `Landlord share for property booking ID: ${propertyId}`,
          },
          on_hold: false,
        }
      ]
      */
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(orderOptions);

    // Return the generated order ID back to your LockPropertyModal component
    return NextResponse.json({ id: order.id });

  } catch (error: unknown) {
    console.error("Razorpay Order Creation Failure:", error);
    return NextResponse.json(
      { error: "Internal payment processing error occurred." },
      { status: 500 }
    );
  }
}