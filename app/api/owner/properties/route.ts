export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { getToken } = await auth();
  const token = await getToken();

  // Forward the request to the backend, preserving query parameters
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
  const url = `${backendUrl}/owner/properties`;

  try {
    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Error proxying GET to backend:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { getToken } = await auth();
  const token = await getToken();

  // Forward the request to the backend
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
  const url = `${backendUrl}/owner/properties`;

  // We need to forward the body as FormData (since the endpoint expects multipart/form-data for file uploads)
  // Read the incoming request's body as FormData
  try {
    const formData = await request.formData();

    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Do not set Content-Type; let fetch set it from the FormData
      },
      body: formData,
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Error proxying POST to backend:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}