import { Property } from "@/types/property";
import PropertyCardWithWishlist from "@/components/PropertyCardWithWishlist";

// 1. Fetch directly on the Vercel server, NOT the user's browser
async function getFeaturedProperty() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://livinggo-website.onrender.com/api';
    
    // 2. THE MAGIC LINE: Cache the cross-ocean request for 60 seconds
    const res = await fetch(`${apiUrl}/properties`, { 
      next: { revalidate: 60 } 
    });
    
    if (!res.ok) return null;
    
    const properties = await res.json();
    
    // 3. Do the heavy math/sorting on the server
    return properties.sort((a: Property, b: Property) => a.price - b.price)[0];
  } catch (error) {
    return null;
  }
}

// NO "use client" here. This runs securely on the backend.
export default async function PropertyPreview() {
  const property = await getFeaturedProperty();

  if (!property) return null;

  return (
    <div className="[&>article]:shadow-none">
      <PropertyCardWithWishlist property={property} />
    </div>
  );
}