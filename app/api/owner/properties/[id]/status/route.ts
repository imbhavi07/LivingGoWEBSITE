export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Please Sign-in First 😉" }, { status: 401 });
  }

  // Get the session token to forward to backend
  const { getToken } = await auth();
  const token = await getToken();

  // Forward the request to the backend
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
  const url = `${backendUrl}/properties/${id}/status`;

  // Get the body from the request
  const body = await request.json();

  try {
    const backendResponse = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json({ error: 'Failed to update property status' }, { status: 500 });
  }
}