import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

export const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) => {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ";
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg hover:opacity-95",
    ghost:
      "bg-transparent border border-gray-200 text-gray-800 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:opacity-90",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
