import { Home } from "lucide-react";

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white p-8 text-center shadow-soft">
      <div className="mb-4 rounded-full bg-linen p-4">
        <Home className="h-7 w-7 text-clay" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{message}</p>
    </div>
  );
}
