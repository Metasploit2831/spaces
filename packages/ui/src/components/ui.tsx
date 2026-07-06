import { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variants = {
    primary: "border border-[rgba(255,255,255,0.10)] bg-[#242427] text-[#f5f6f7] hover:bg-[#303034]",
    secondary: "border border-[rgba(255,255,255,0.08)] bg-[#141416] text-[#d0d3d7] hover:bg-[#1a1b1d]",
    ghost: "text-[#8a8f98] hover:bg-[#141416] hover:text-[#f5f6f7]",
    danger: "border border-[#3a2020] bg-[#241415] text-[#eb5757] hover:bg-[#32191a]",
  };
  return (
    <button
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
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
      className={`grid h-8 w-8 place-items-center rounded-full border border-transparent bg-transparent text-[#8a8f98] transition hover:bg-[#1a1b1d] hover:text-[#f5f6f7] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-9 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#141416] px-3 text-[13px] text-[#f5f6f7] outline-none transition placeholder:text-[#8a8f98] focus:border-[rgba(255,255,255,0.16)] ${className}`}
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
