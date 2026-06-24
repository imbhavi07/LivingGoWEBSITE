"use client";

import { Heart } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type WishlistButtonProps = {
  propertyId: string;
  saved: boolean;
  onSave: (id: string) => void;
};

export function WishlistButton({ propertyId, saved, onSave }: WishlistButtonProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <button
      onClick={() => !isSignedIn ? router.push("/login") : onSave(propertyId)}
      className="rounded-full bg-linen p-1.5 sm:p-2 text-ink transition hover:bg-oat -mt-1 -mr-1"
      aria-label={saved ? "Remove from wishlist" : "Save property"}
    >
      <Heart className={saved ? "h-3.5 w-3.5 sm:h-4 sm:w-4 fill-clay text-clay" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} />
    </button>
  );
}