"use client";

import Link from "next/link";
import { Users, DollarSign, Snowflake, Utensils } from "lucide-react";

interface CategoryItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const categories: CategoryItem[] = [
  { label: "Girls PG", icon: Users, href: "/listings?gender=girls" },
  { label: "Boys PG", icon: Users, href: "/listings?gender=boys" },
  { label: "Budget", icon: DollarSign, href: "/listings?sort=price" },
  { label: "AC / Non AC", icon: Snowflake, href: "/listings?ac=true" },
  { label: "Food Available", icon: Utensils, href: "/listings?food=true" },
];

export function CategoriesRibbon() {
  return (
    <section className="px-4 py-6 bg-brand-bg border-y border-brand-dark/10" aria-label="PG Categories">
      <div className="mx-auto max-w-7xl">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-2 -mx-2">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="flex flex-col items-center gap-2 shrink-0 w-28 sm:w-32 p-4 rounded-2xl bg-white shadow-card border border-brand-dark/10 hover:shadow-card-hover hover:border-brand-green/20 transition-all duration-200"
              aria-label={category.label}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg text-brand-green">
                <category.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-brand-dark text-center leading-tight">
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}