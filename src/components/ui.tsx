import { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variants = {
    primary: "border border-[#e4f222] bg-[#e4f222] text-[#08090a] hover:bg-[#f0fb52]",
    secondary: "border border-[#23252a] bg-[#161718] text-[#d0d6e0] hover:bg-[#23252a]",
    ghost: "text-[#8a8f98] hover:bg-[#161718] hover:text-[#f7f8f8]",
    danger: "border border-[#3a2020] bg-[#241415] text-[#eb5757] hover:bg-[#32191a]",
  };
  return (
    <button
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-medium tracking-[-0.01em] transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
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
      className={`grid h-8 w-8 place-items-center rounded-md border border-[#23252a] bg-[#161718] text-[#8a8f98] transition hover:border-[#323334] hover:bg-[#23252a] hover:text-[#f7f8f8] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-9 rounded-md border border-[#23252a] bg-[#161718] px-3 text-[13px] text-[#f7f8f8] outline-none transition placeholder:text-[#62666d] focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e6ad2]/20 ${className}`}
      {...props}
    />
  );
}

export function Menu({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`rounded-md border border-[#23252a] bg-[#161718] p-1 text-[12px] text-[#f7f8f8] shadow-[rgba(8,9,10,0.6)_0px_4px_32px_0px] ${className}`} style={style}>
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
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition hover:bg-[#23252a] ${
        danger ? "text-[#eb5757]" : "text-[#d0d6e0]"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
