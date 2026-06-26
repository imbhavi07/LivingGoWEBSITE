import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function verifyRazorpayPayment(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    // Return true if payment is captured, else false
    return payment && payment.status === 'captured';
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return false;
  }
}