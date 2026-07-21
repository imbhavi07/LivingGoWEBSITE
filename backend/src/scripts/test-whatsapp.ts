import "dotenv/config";
import { queueVisitCreated, queueOTPVerify, getQueueStats } from "../queues/whatsapp.queue";

async function runTest() {
  console.log("🚀 Starting Queue Test...");

  // Test 1: Fire a high-priority visit creation job
  await queueVisitCreated({
    visitId: "cmrrqoryi000ck62e17odxfak",
    visitToken: "VISIT-7ACE69",
    studentName: "Bhavishya",
    studentPhone: "917310690877",
    propertyId: "MG-B-946714",
    propertyTitle: "Kamla Nagar PG",
    propertyLocation: "North Campus",
    visitDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    timeSlot: "3:00 PM",
    visitOtp: "7710",
    phoneNumber: "917310690877",
    userRole: "student",
  });
  console.log("✅ Visit job enqueued.");

  // Test 2: Fire an OTP verification job
  await queueOTPVerify({
    visitId: "cmrrqoryi000ck62e17odxfak",
    visitToken: "VISIT-7ACE69",
    providedOtp: "7710",
    attemptNumber: 1,
    phoneNumber: "917310690877",
    userRole: "student",
  });
  console.log("✅ OTP job enqueued.");

  // Check stats
  const stats = await getQueueStats();
  console.log("📊 Current Queue Stats:", JSON.stringify(stats, null, 2));

  process.exit(0);
}

runTest().catch(console.error);