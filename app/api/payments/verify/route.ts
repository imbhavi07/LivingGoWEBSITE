import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // FIXED: Destructure the camelCase keys sent by the frontend
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, propertyId } = await request.json();

    // Validate required fields
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !propertyId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify Razorpay signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // FIXED: Use the camelCase variables for the HMAC hash
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid Razorpay signature' }, { status: 400 });
    }

    // Get the authenticated user's token from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward only the required fields to the Express backend
    const backendResponse = await fetch(
      'http://localhost:5000/api/token-payments/confirm-razorpay',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // DEMO HACK: Force the Express backend to use the guaranteed dev profile
          Authorization: `Bearer development-token`,
        },
        body: JSON.stringify({
          propertyId,
          razorpayPaymentId: razorpayPaymentId, 
        }),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Payment verification failed' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in payment verification route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}