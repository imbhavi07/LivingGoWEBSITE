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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: property.title,
    description: property.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location,
      addressRegion: 'Delhi',
      addressCountry: 'IN',
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyClient property={property} />
    </>
  );
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await getProperty(params.id);

  if (!property) {
    return {
      title: 'Property not found',
      description: 'The requested listing could not be found.',
    };
  }

  return {
    title: `${property.title} | Best ${property.roomType} PG in ${property.location}, Delhi`,
    description: `Looking for a PG in ${property.location}? Book ${property.title}. Amenities include ${property.facilities.slice(0, 3).join(', ')}. Rent starts at ₹${property.price}/month.`,
    alternates: {
      canonical: `https://livinggo.in/properties/${property.id}`,
    },
  };
}
