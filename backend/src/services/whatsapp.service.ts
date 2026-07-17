import { env } from "../config/env";

export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
  // TODO: Implement actual WhatsApp API integration (e.g., Twilio, Gupshup, etc.)
  // For now, we'll just log the message.
  console.log(`Sending WhatsApp message to ${phoneNumber}: ${message}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real implementation, you would throw an error if the message fails to send.
  // For now, we assume it always succeeds.
}