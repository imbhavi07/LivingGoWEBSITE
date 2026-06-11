// components/StarRating.tsx  (NEW FILE - shared component)
// Usage: <StarRating value={4.0} count={149} /> — matches the screenshot style

export type RatingData = {
  overall: number | null;
  cleanliness: number | null;
  food: number | null;
  security: number | null;
  management: number | null;
  location: number | null;
  count: number;
};

type StarRatingProps = {
  value: number | null;       // e.g. 4.0
  count?: number;             // review count
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
};

export function StarRating({ value, count, size = "md", showCount = true }: StarRatingProps) {
  if (value === null) {
    return (
      <span className="text-xs text-muted font-medium">No reviews yet</span>
    );
  }

  const starSizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const starSize = starSizes[size];

  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-black text-ink ${textSizes[size]}`}>{value.toFixed(1)}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(1, Math.max(0, value - (star - 1)));
          return (
            <StarSVG key={star} fill={fill} className={starSize} id={`sg-${star}`} />
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className={`text-muted ${textSizes[size]}`}>({count.toLocaleString()})</span>
      )}
    </div>
  );
}

function StarSVG({ fill, className, id }: { fill: number; className: string; id: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#F59E0B" />
          <stop offset={`${fill * 100}%`} stopColor="#D1D5DB" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.444a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118L10 14.187l-3.353 2.434c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.864 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.957z"
      />
    </svg>
  );
}

// ─── Breakdown bar (used in property page and admin view) ────────────────────
export type RatingBreakdownProps = {
  rating: RatingData;
};

export function RatingBreakdown({ rating }: RatingBreakdownProps) {
  const categories = [
    { label: "Cleanliness", value: rating.cleanliness },
    { label: "Food",        value: rating.food },
    { label: "Security",    value: rating.security },
    { label: "Management",  value: rating.management },
    { label: "Location",    value: rating.location },
  ];

  return (
    <div className="space-y-4">
      {/* Overall */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-4xl font-black text-ink">{rating.overall?.toFixed(1) ?? "—"}</p>
          <StarRating value={rating.overall} count={rating.count} size="md" showCount={true} />
        </div>
      </div>

      {/* Per-category bars */}
      <div className="space-y-2">
        {categories.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-24 text-xs font-semibold text-muted shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-linen rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${((value ?? 0) / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-ink w-6 text-right">{value?.toFixed(1) ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}