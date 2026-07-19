import { Request, Response } from "express";

// Fallback to a hardcoded string if ENV is missing, but always prefer ENV in production
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "LivingGo_Secret_Token_2026";

export const verifyWebhook = (req: Request, res: Response) => {
  // Parse params from the webhook verification request
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Check if a mode and token were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      console.log("✅ WHATSAPP WEBHOOK VERIFIED");
      // Responds with the challenge token from the request
      return res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      console.error("❌ WHATSAPP WEBHOOK VERIFICATION FAILED: Token mismatch");
      return res.sendStatus(403);
    }
  }
  
  return res.sendStatus(400);
};

export const handleIncomingMessage = (req: Request, res: Response) => {
  const body = req.body;

  // Meta sends events wrapped in a specific object
  if (body.object === "whatsapp_business_account") {
    // Acknowledge receipt immediately so Meta doesn't retry sending the same message
    res.status(200).send("EVENT_RECEIVED");

    try {
      // Look at the incoming payload structure
      // We will build out the exact parsing logic here next!
      console.log("📥 Incoming WhatsApp Event:", JSON.stringify(body, null, 2));
      
      // Basic extraction example (we will expand this):
      // const messageEntry = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      // if (messageEntry) {
      //   console.log("New Message from:", messageEntry.from);
      //   console.log("Message Text:", messageEntry.text?.body);
      // }

    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
    }
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
};