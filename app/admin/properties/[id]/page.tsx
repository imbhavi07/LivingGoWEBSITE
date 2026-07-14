"use client";

import { useEffect, useState } from "react";
import { getAdminProperty } from "@/lib/api/admin-properties";
import { StatCard } from "@/components/admin/StatCard";
import { BadgeCheck, Copy, ExternalLink, MapPinned } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCreateReview } from "@/hooks/useAdmin";
import { useToast } from "@/contexts/ToastContext";

export default function PropertyManagementPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    studentName: "",
    rating: 5,
    content: ""
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const { user } = useAuthContext();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const { create: createReview } = useCreateReview();
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAdminProperty(id);
        setProperty(data);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <AdminShell>
        <main className="p-10">Loading...</main>
      </AdminShell>
    );
  }

  if (!property) {
    return (
      <AdminShell>
        <main className="p-10">
          <h1 className="text-3xl font-black">Property not found</h1>
        </main>
      </AdminShell>
    );
  }

  const totalBeds = (property.bedsSingle ?? 0) + (property.bedsDouble ?? 0) + (property.bedsTriple ?? 0);
  const occupiedBeds = property.occupiedBeds ?? 0;
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancy = totalBeds === 0 ? 0 : Math.round((occupiedBeds / totalBeds) * 100);
  const reviewCount = property.reviews?.length ?? 0;
  const wishlistCount = property.wishlistedBy?.length ?? 0;
  const tokenRevenue = ((property.tokenPayments ?? []) as { amount: number | null }[]).reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewForm.studentName.trim() || !reviewForm.content.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setReviewLoading(true);
    try {
      await createReview(id, {
        studentName: reviewForm.studentName,
        rating: reviewForm.rating,
        content: reviewForm.content
      });

      // Reset form
      setReviewForm({
        studentName: "",
        rating: 5,
        content: ""
      });

      // Refresh property data to show new review
      const updatedProperty = await getAdminProperty(id);
      setProperty(updatedProperty);

      showToast("Review added successfully!", "success");
    } catch (error) {
      showToast("Failed to add review. Please try again.", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <AdminShell>
      <main className="space-y-8">

        <div className="rounded-3xl bg-gradient-to-r from-[#1f2937] to-[#111827] p-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/10 px-4 py-2 font-mono text-sm">
                  {property.propertyCode}
                </span>
                <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm">
                  <BadgeCheck className="h-4 w-4" />
                  {property.status}
                </span>
              </div>
              <h1 className="mt-5 text-5xl font-black">{property.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-white/70">
                <MapPinned className="h-5 w-5" />
                {property.location}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(property.propertyCode)}
                className="rounded-2xl bg-white px-5 py-3 font-bold text-black hover:bg-gray-200"
              >
                <Copy className="mr-2 inline h-4 w-4" />
                Copy ID
              </button>
              <a
                href={`/properties/${property.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-amber-500 px-5 py-3 font-bold text-black hover:bg-amber-400"
              >
                <ExternalLink className="mr-2 inline h-4 w-4" />
                Open Listing
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex justify-between">
              <span className="font-bold">Occupancy</span>
              <span>{occupancy}%</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {occupiedBeds} / {totalBeds} Beds
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${occupancy}%` }}
              />
            </div>
          </div>
          <StatCard title="Wishlist" value={wishlistCount} subtitle="Students Interested" />
          <StatCard title="Reviews" value={reviewCount} subtitle="Total Reviews" />
          <StatCard
            title="Token Revenue"
            value={`₹${new Intl.NumberFormat("en-IN").format(tokenRevenue)}`}
            subtitle="Collected"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white p-6">
            <h2 className="text-xl font-black">Owner Information</h2>
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-xl font-black text-white">
                  {property.owner?.name?.charAt(0) ?? "?"}
                </div>
                <div>
                  <p className="font-bold">{property.owner?.name ?? "—"}</p>
                  <p className="text-sm text-muted">Property Owner</p>
                </div>
              </div>
              <p>
                <strong>Email:</strong> {property.owner?.email ?? "—"}
              </p>
              <p>
                <strong>Phone:</strong> {property.owner?.phone ?? "—"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-6">
            <h2 className="text-xl font-black">Property</h2>
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

        {isSuperAdmin && (
          <div className="mt-8">
            <div className="rounded-3xl border border-black/5 bg-white p-6">
              <h2 className="text-xl font-black mb-4">Add Review (SUPER_ADMIN Only)</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted mb-2">Student Name*</label>
                  <input
                    type="text"
                    value={reviewForm.studentName}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Enter student name for this review"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted mb-2">Rating (1-5)*</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                      className="select select-bordered w-full"
                    >
                      {[1, 2, 3, 4, 5].map(r => (
                        <option key={r} value={r}>
                          {r} Star{r === 1 ? "" : "s"}
                        >
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted mb-2">Review Length</label>
                    <span className="text-sm text-muted">
                      {reviewForm.content.length}/1000 characters
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted mb-2">Review Content*</label>
                  <textarea
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                    rows="4"
                    placeholder="Share your experience about this property..."
                    className="textarea textarea-bordered w-full"
                    required
                    maxLength="1000"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className={`btn-primary w-full ${reviewLoading ? "opacity-50" : ""}`}
                  >
                    {reviewLoading ? "Adding Review..." : "Add Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminShell>
  );
}