"use client";

// components/ReviewSection.tsx  (NEW FILE)
// Drop this into app/properties/[id]/page.tsx

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Star, Send, Loader2 } from "lucide-react";
import { StarRating, RatingBreakdown, type RatingData } from "@/components/StarRating";
import { submitReview } from "@/lib/api/residence";
import { Button } from "@/components/Button";
type Review = {
  id: string;
  cleanliness: number;
  food: number;
  security: number;
  management: number;
  location: number;
  comment?: string | null;
  createdAt: string;
  student: { id: string; name: string };
};

type ReviewSectionProps = {
  propertyId: string;
  rating: RatingData;
  reviews: Review[];
  userRole?: string | null;  // "student" | "owner" | "admin" | null
};

const CATEGORIES = [
  { key: "cleanliness" as const, label: "Cleanliness" },
  { key: "food"        as const, label: "Food" },
  { key: "security"   as const, label: "Security" },
  { key: "management" as const, label: "Management" },
  { key: "location"   as const, label: "Location" },
];

export function ReviewSection({ propertyId, rating, reviews: initialReviews, userRole }: ReviewSectionProps) {
  const { isSignedIn } = useAuth();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [currentRating, setCurrentRating] = useState(rating);

  const [scores, setScores] = useState({ cleanliness: 0, food: 0, security: 0, management: 0, location: 0 });
  const [comment, setComment] = useState("");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = Object.values(scores).every((v) => v > 0);

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const newReview = await submitReview(propertyId, { ...scores, comment: comment || undefined });
      setReviews((prev) => [newReview, ...prev.filter((r) => r.student.id !== newReview.student.id)]);

      // Recalculate rating locally
      const allReviews = [newReview, ...reviews.filter((r) => r.student.id !== newReview.student.id)];
      const newOverall = allReviews.reduce((sum, r) => {
        const avg = (r.cleanliness + r.food + r.security + r.management + r.location) / 5;
        return sum + avg;
      }, 0) / allReviews.length;
      setCurrentRating({ ...currentRating, overall: Math.round(newOverall * 10) / 10, count: allReviews.length });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-black text-ink">Reviews & Ratings</h2>

      {/* Aggregate rating */}
      <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
        <RatingBreakdown rating={currentRating} />
      </div>

      {/* Review form — only for logged-in students */}
      {!isSignedIn && (
        <div className="mt-4 rounded-2xl bg-linen p-5 text-center">
          <p className="text-sm font-semibold text-ink">Sign in to leave a review</p>
          <p className="text-xs text-muted mt-1">Only students with an account can rate this PG</p>
        </div>
      )}

      {isSignedIn && userRole && userRole !== "student" && (
        <div className="mt-4 rounded-2xl bg-linen p-5 text-center">
          <p className="text-sm text-muted">Reviews can only be submitted by students</p>
        </div>
      )}

      {isSignedIn && userRole === "student" && !submitted && (
        <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft space-y-5">
          <h3 className="font-bold text-ink">Your Review</h3>

          {CATEGORIES.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <span className="w-24 text-sm font-semibold text-muted shrink-0">{label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = hoveredKey === key
                    ? star <= hoveredStar
                    : star <= scores[key];
                  return (
                    <button
                      key={star}
                      className="focus:outline-none"
                      onMouseEnter={() => { setHoveredKey(key); setHoveredStar(star); }}
                      onMouseLeave={() => { setHoveredKey(null); setHoveredStar(0); }}
                      onClick={() => setScores((s) => ({ ...s, [key]: star }))}
                      aria-label={`Rate ${label} ${star} stars`}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${isActive ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    </button>
                  );
                })}
              </div>
              {scores[key] > 0 && (
                <span className="text-xs font-bold text-ink">{scores[key]}/5</span>
              )}
            </div>
          ))}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)…"
            className="w-full rounded-xl border border-black/10 bg-linen p-3 text-sm text-ink placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-ink/10"
            rows={3}
          />

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-ink/90 transition-colors"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Review
          </button>
        </div>
      )}

      {isSignedIn && userRole === "student" && submitted && (
        <div className="mt-4 rounded-2xl bg-green-50 p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-green-700 font-semibold">✓ Review submitted — thank you!</p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs font-bold text-green-700 underline underline-offset-2 hover:text-green-900"
          >
            Edit review
          </button>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="mt-4 space-y-4">
          {reviews.map((review) => {
            const avg = (review.cleanliness + review.food + review.security + review.management + review.location) / 5;
            return (
              <div key={review.id} className="rounded-2xl bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{review.student.name}</p>
                    <p className="text-xs text-muted">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <StarRating value={Math.round(avg * 10) / 10} showCount={false} size="sm" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-5">
                  {CATEGORIES.map(({ key, label }) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-muted">{label}</p>
                      <p className="text-sm font-black text-ink">{review[key]}</p>
                    </div>
                  ))}
                </div>

                {review.comment && (
                  <p className="mt-3 text-sm text-muted leading-relaxed border-t border-black/5 pt-3">
                    {review.comment}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="mt-4 rounded-2xl bg-linen p-5 text-center">
          <p className="text-sm text-muted">No reviews yet — be the first!</p>
        </div>
      )}
    </section>
  );
}