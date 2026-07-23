import "dotenv/config";
import { queueVisitCreated, queueOTPVerify, getQueueStats, visitQueue } from "../queues/whatsapp.queue";

async function runTest() {
  console.log("🚀 Starting Queue Test...");

  // Test 1: Fire a high-priority visit creation job
await queueVisitCreated({
  visitId: "test-new-run-001",
  visitToken: "TEST-001",
  studentName: "Bhavishya",
  studentPhone: "917310690877", // <--- Your number here
  propertyId: "MG-B-946714",
  propertyTitle: "Kamla Nagar PG",
  propertyLocation: "North Campus",
  visitDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  timeSlot: "3:00 PM",
  visitOtp: "7718",
  phoneNumber: "919355405404",
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