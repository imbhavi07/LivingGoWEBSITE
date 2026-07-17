import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "glow";
  size?: "sm" | "md" | "lg";
};

export function buttonClasses(variant: ButtonProps["variant"] = "primary", size: ButtonProps["size"] = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-60",
    size === "sm" && "min-h-9 px-3 text-xs",
    size === "md" && "min-h-11 px-5 text-sm",
    size === "lg" && "min-h-14 px-6 text-base",
    variant === "primary" && "bg-ink text-white shadow-soft hover:bg-black",
    variant === "secondary" && "bg-white text-ink shadow-soft ring-1 ring-black/5 hover:bg-linen",
    variant === "ghost" && "bg-transparent text-ink hover:bg-black/5",
    variant === "outline" && "border border-ink text-ink hover:bg-ink/10",
    variant === "glow" && "animate-green-glow",
    className
  );
}

export function Button({ children, className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  );
}
