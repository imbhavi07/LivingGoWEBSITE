// NO "use client" - This is now a blazing fast Server Component!
import { FilterBar } from "@/components/FilterBar";
import { ClientPropertyGrid } from "./ClientPropertyGrid";
import { getProperties } from "@/lib/api/properties";
import type { PropertyFilters } from "@/types/property";
import Pagination from "@/components/Pagination";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ListingsPage(props: PageProps) {
  // 2. Await the searchParams promise before doing anything else
  const searchParams = await props.searchParams;

  // 3. Now you can use them exactly like before
  const filters: PropertyFilters = {
    budget: searchParams.budget as string | undefined,
    location: searchParams.location as string | undefined,
    roomType: searchParams.roomType as PropertyFilters["roomType"],
    preference: searchParams.preference as PropertyFilters["preference"],
  };

  const currentPage = Number(searchParams.page ?? 1);

  const { properties, meta } = await getProperties(filters, currentPage, 12);

  return (
    <main className="relative w-full bg-[#f9e7d3] min-h-screen overflow-hidden">
      {/* 2. MAX-WIDTH CONTENT CONTAINER (Sits safely above the gradient) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">

        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-clay">Student housing</p>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Find your next room</h1>
        </div>

        <FilterBar />

        <ClientPropertyGrid properties={properties} />

        <Pagination
          current={currentPage}
          total={meta.pages}
        />

      </div>
    </main>
  );
}