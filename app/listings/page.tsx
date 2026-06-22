// NO "use client" - This is now a blazing fast Server Component!
import { FilterBar } from "@/components/FilterBar";
import { ClientPropertyGrid } from "./ClientPropertyGrid";
import { getProperties } from "@/lib/api/properties";
import type { PropertyFilters } from "@/types/property";

// Next.js automatically passes URL parameters here
export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  // Cast URL search parameters into your expected filter types
  // Cast URL search parameters into your expected filter types
  const filters: PropertyFilters = {
    budget: searchParams.budget as string | undefined,
    location: searchParams.location as string | undefined,
    roomType: searchParams.roomType as PropertyFilters["roomType"],
    preference: searchParams.preference as PropertyFilters["preference"],
  };

  // The server fetches this data BEFORE the user ever sees the screen!
  const properties = await getProperties(filters);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-clay">Student housing</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Find your next room</h1>
      </div>
      
      {/* FilterBar automatically reads from the URL now */}
      <FilterBar />
      
      {/* We pass the pre-fetched properties straight into our client grid */}
      <ClientPropertyGrid properties={properties} />
    </main>
  );
}