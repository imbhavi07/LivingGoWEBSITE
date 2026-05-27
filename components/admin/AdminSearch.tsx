"use client";

import { Search } from "lucide-react";

type AdminSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function AdminSearch({ value, onChange, placeholder }: AdminSearchProps) {
  return (
    <label className="relative block w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input bg-white pl-11"
        placeholder={placeholder}
      />
    </label>
  );
}
