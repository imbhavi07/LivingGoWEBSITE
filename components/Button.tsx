import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function buttonClasses(variant: ButtonProps["variant"] = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" && "bg-ink text-white shadow-soft hover:bg-black",
    variant === "secondary" && "bg-white text-ink shadow-soft ring-1 ring-black/5 hover:bg-linen",
    variant === "ghost" && "bg-transparent text-ink hover:bg-black/5",
    className
  );
}

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, className)}
      {...props}
    >
      {children}
    </button>
  );
}
