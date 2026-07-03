"use client";

import Link from "next/link";

type Props = {
  current: number;
  total: number;
};

export default function Pagination({ current, total }: Props) {
  return (
    <div className="mt-10 flex items-center justify-center gap-6">
      {current > 1 ? (
        <Link
          href={`/listings?page=${current - 1}`}
          className="rounded-lg border px-5 py-2 hover:bg-gray-100"
        >
          ← Previous
        </Link>
      ) : (
        <div className="hidden" />
      )}

      <span className="font-semibold">
        Page {current} of {total}
      </span>

      {current < total ? (
        <Link
          href={`/listings?page=${current + 1}`}
          className="rounded-lg border px-5 py-2 hover:bg-gray-100"
        >
          Next →
        </Link>
      ) : (
        <div className="hidden" />
      )}
    </div>
  );
}