import { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variants = {
    primary: "bg-mint text-zinc-950 hover:bg-[#9cebd4]",
    secondary: "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
    ghost: "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50",
    danger: "border border-red-900/60 bg-red-950/70 text-red-200 hover:bg-red-900/80",
  };
  return (
    <button
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-semibold shadow-sm transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function IconButton({
  className = "",
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 shadow-sm transition hover:bg-zinc-800 hover:text-zinc-50 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-9 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-zinc-50 shadow-sm outline-none transition placeholder:text-zinc-500 focus:border-mint/60 focus:ring-2 focus:ring-mint/20 ${className}`}
      {...props}
    />
  );
}

export function Menu({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`rounded-md border border-zinc-800 bg-zinc-950 p-1 text-[12px] text-zinc-100 shadow-2xl ${className}`} style={style}>
      {children}
    </div>
  );
}

export function MenuItem({
  children,
  danger,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left transition hover:bg-zinc-900 ${
        danger ? "text-red-300" : "text-zinc-200"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
