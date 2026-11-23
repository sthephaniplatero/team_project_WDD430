import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-md border border-outline-variant bg-card shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
