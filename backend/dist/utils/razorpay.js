"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRazorpayPayment = verifyRazorpayPayment;
const razorpay_1 = __importDefault(require("razorpay"));
const razorpay = new razorpay_1.default({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
async function verifyRazorpayPayment(paymentId) {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        // Return true if payment is captured, else false
        return payment && payment.status === 'captured';
    }
    catch (error) {
        console.error("Razorpay verification error:", error);
        return false;
    }
}
