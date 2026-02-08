import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline" | "destructive";
};

export function Button({
  variant = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-cyan-600 text-white hover:bg-cyan-500",
    ghost: "hover:bg-white/10",
    outline: "border-2 border-cyan-500/60 bg-transparent hover:bg-cyan-500/10",
    destructive: "bg-red-600/80 text-white hover:bg-red-500/80",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
