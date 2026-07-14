import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get("authorization");

    // Prepare headers to forward to the backend
    const headers = new Headers();

    // If we have an auth header, forward it to the backend
    if (authHeader) {
      headers.set("authorization", authHeader);
    }

    // Forward the request to the backend
    const backendUrl = `${process.env.BACKEND_URL}`;
    const response = await fetch(`${backendUrl}/api/admin/coupons`, {
      method: "GET",
      headers: headers,
      // Forward cookies if needed for authentication
      credentials: "include",
    });

    // If the backend returns an error status, return that status
    if (!response.ok) {
      let errorMessage = "Failed to fetch coupons";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Get the JSON data from the backend response
    const data = await response.json();

    // Return the data to the frontend
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/admin/coupons route:", error);

    // Return a 500 error with a generic message
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}