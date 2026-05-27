import { cn } from "@/lib/utils";

type AdminStatusBadgeProps = {
  status: string;
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-black capitalize",
        status === "approved" || status === "active" ? "bg-green-50 text-moss" : "",
        status === "pending" ? "bg-amber-50 text-amber-700" : "",
        status === "rejected" || status === "suspended" ? "bg-red-50 text-red-700" : ""
      )}
    >
      {status}
    </span>
  );
}
