import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({
  hover = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-800 bg-[#111827] ${
        hover
          ? "transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
