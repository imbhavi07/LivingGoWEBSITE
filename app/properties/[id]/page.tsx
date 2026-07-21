import { EmptyState } from "@/components/EmptyState";
import { Metadata } from "next";
import PropertyClient from "./PropertyClient";

async function getProperty(id: string) {
  try {
    // We must fetch from your actual Backend API, not the Next.js frontend URL!
    // This defaults to localhost:5000 if the env variable isn't found. 
    // Adjust the port if your backend runs on a different one (e.g., 8000).
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    
    // Ensure we don't double up on '/api' in the URL path
    const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/properties/${id}`
        : `${baseUrl}/api/properties/${id}`;

    const res = await fetch(apiUrl, {
      cache: "no-store", // Ensures fresh data is always fetched
    });

    if (!res.ok) {
      console.error(`Backend returned ${res.status} for property ${id}`);
      return null;
    }

    // Bulletproof check: Read as text first to prevent HTML parsing crashes
    const text = await res.text();
    if (!text || text.startsWith("<!DOCTYPE")) {
        console.error("Received HTML instead of JSON from backend");
        return null;
    }

    const json = JSON.parse(text);
    return json.data || json.property || json; // Extract the payload safely
  } catch (error) {
    console.error("Failed to fetch property server-side:", error);
    return null;
  }
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object (Required in Next.js 15+)
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState title="Property not found" message="This listing may have been removed or the link may be incorrect." />
      </main>
    );
  }

  return <PropertyClient property={property} />;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // 1. Await params for Next.js 15 compatibility
  const { id } = await params;
  const property = await getProperty(id);
  
  // 2. If the property doesn't exist, return fallback metadata instantly (Prevents crash!)
  if (!property) {
    return {
      title: 'Property Not Found | LivingGo',
      description: 'The requested property could not be found.',
    };
  }

  // 3. Safely handle the facilities array (Prevents the .slice() crash!)
  const safeFacilities = Array.isArray(property.facilities) ? property.facilities : [];
  const facilitiesText = safeFacilities.length > 0 
    ? `Amenities include ${safeFacilities.slice(0, 3).join(', ')}.` 
    : '';

  return {
    title: `${property.title || 'Premium'} | Best ${property.roomType || 'Shared'} PG in ${property.location || 'Delhi'}`,
    description: `Looking for a PG in ${property.location || 'Delhi'}? Book ${property.title || 'this property'}. ${facilitiesText} Rent starts at ₹${property.price || 'affordable rates'}/month.`,
    alternates: {
      canonical: `https://livinggo.in/properties/${id}`,
    },
  };
}