export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Please Sign-in First 😉" }, { status: 401 });
  }

  const { getToken } = await auth();
  const token = await getToken();

  // Forward the request to the backend
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
  const url = `${backendUrl}/owner/properties/${id}`;

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
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Proxy PUT to the backend
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Please Sign-in First 😉" }, { status: 401 });
  }

  const { getToken } = await auth();
  const token = await getToken();

  // Forward the request to the backend
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
  const url = `${backendUrl}/owner/properties/${id}`;

  try {
    const formData = await request.formData();

    const backendResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Do not set Content-Type; let fetch set it from the FormData
      },
      body: formData,
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Error proxying PUT to backend:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Please Sign-in First 😉" }, { status: 401 });
  }

  const { getToken } = await auth();
  const token = await getToken();

  // Forward the request to the backend
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
  const url = `${backendUrl}/owner/properties/${id}`;

  try {
    const backendResponse = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Error proxying DELETE to backend:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}