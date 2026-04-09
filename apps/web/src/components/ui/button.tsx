import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-violet-600 text-white shadow hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
  destructive:
    "bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
  outline:
    "border border-white/20 bg-transparent shadow-sm hover:bg-white/10 hover:text-white",
  secondary:
    "bg-white/10 text-white shadow-sm hover:bg-white/15",
  ghost: "hover:bg-white/10 hover:text-white",
  link: "text-violet-300 underline-offset-4 hover:underline",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

/** Kept for compatibility with shadcn-style imports (maps to primary button). */
const buttonVariants = (opts?: { variant?: ButtonProps["variant"]; size?: ButtonProps["size"]; className?: string }) =>
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    opts?.variant ? variantClass[opts.variant] : variantClass.default,
    opts?.size ? sizeClass[opts.size] : sizeClass.default,
    opts?.className
  );

export { Button, buttonVariants };
