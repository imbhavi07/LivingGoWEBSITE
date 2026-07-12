import { getAdminProperty } from "@/lib/api/admin-properties";
import { StatCard } from "@/components/admin/StatCard";
import { BadgeCheck, Copy, ExternalLink, MapPinned} from "lucide-react";
export default async function PropertyManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await getAdminProperty(id);
  if (!property) {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-black">
        Property not found
      </h1>
    </main>
  );
}
  const totalBeds =
  (property.bedsSingle ?? 0) +
  (property.bedsDouble ?? 0) +
  (property.bedsTriple ?? 0);

  const occupiedBeds = property.occupiedBeds ?? 0;
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancy =totalBeds === 0 ? 0 : Math.round((occupiedBeds / totalBeds) * 100);
  const reviewCount = property.reviews.length;
  const wishlistCount = property.wishlist.length;
  const tokenRevenue = (property.tokenPayments as { amount: number | null }[]).reduce(
  (sum, payment) => sum + (payment.amount ?? 0),
  0
);

  return (
    <main className="space-y-8">

      

<div className="rounded-3xl bg-gradient-to-r from-[#1f2937] to-[#111827] p-8 text-white">

  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

    <div>

      <div className="flex items-center gap-3">

        <span className="rounded-full bg-white/10 px-4 py-2 font-mono text-sm">

          {property.propertyCode}

        </span>

        <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm">

          <BadgeCheck className="h-4 w-4"/>

          {property.status}

        </span>

      </div>

      <h1 className="mt-5 text-5xl font-black">

        {property.title}

      </h1>

      <p className="mt-3 flex items-center gap-2 text-white/70">

        <MapPinned className="h-5 w-5"/>

        {property.location}

      </p>

    </div>

    <div className="flex flex-wrap gap-3">

      <button
        onClick={() =>
          navigator.clipboard.writeText(property.propertyCode)
        }
        className="rounded-2xl bg-white px-5 py-3 font-bold text-black hover:bg-gray-200"
      >
        <Copy className="mr-2 inline h-4 w-4"/>
        Copy ID
      </button>

      <a
        href={`/properties/${property.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-2xl bg-amber-500 px-5 py-3 font-bold text-black hover:bg-amber-400"
      >
        <ExternalLink className="mr-2 inline h-4 w-4"/>
        Open Listing
      </a>

    </div>

  </div>

</div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

  <StatCard
    title="Occupancy"
    
    value={`${occupancy}%`}
    subtitle={`${occupiedBeds} / ${totalBeds} Beds`}
  />

  <div className="rounded-3xl bg-white p-6 shadow-sm">

  <div className="flex justify-between">

    <span className="font-bold">

      Occupancy

    </span>

    <span>

      {occupancy}%

    </span>

  </div>

  <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">

    <div
      className="h-full rounded-full bg-green-500"
      style={{
        width: `${occupancy}%`,
      }}
    />

  </div>

</div>

  <StatCard
    title="Wishlist"
    value={wishlistCount}
    subtitle="Students Interested"
  />

  <StatCard
    title="Reviews"
    value={reviewCount}
    subtitle="Total Reviews"
  />

  <StatCard
    title="Token Revenue"
    value={`₹${new Intl.NumberFormat("en-IN").format(tokenRevenue)}`}
    subtitle="Collected"
  />

</div>

<div className="mt-8 grid gap-6 lg:grid-cols-2">

  <div className="rounded-3xl border border-black/5 bg-white p-6">

    <h2 className="text-xl font-black">
      Owner Information
    </h2>

    <div className="mt-5 space-y-3">

      <div className="flex items-center gap-4">

  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-xl font-black text-white">

    {property.owner?.name?.charAt(0) ?? "?"}

  </div>

  <div>

    <p className="font-bold">

      {property.owner.name}

    </p>

    <p className="text-sm text-muted">

      Property Owner

    </p>

  </div>

</div>

      <p>
        <strong>Email:</strong> {property.owner.email}
      </p>

      <p>
        <strong>Phone:</strong> {property.owner.phone}
      </p>

    </div>

  </div>

  <div className="rounded-3xl border border-black/5 bg-white p-6">

    <h2 className="text-xl font-black">
      Property
    </h2>

    <div className="mt-5 space-y-3">

      <p>
        <strong>Property Code:</strong> {property.propertyCode}
      </p>

      <p>
        <strong>Available Beds:</strong> {availableBeds}
      </p>

      <p>
        <strong>Status:</strong> {property.status}
      </p>

    </div>

  </div>

</div>

    </main>
  );
}