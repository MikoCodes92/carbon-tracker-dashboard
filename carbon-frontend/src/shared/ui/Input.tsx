import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #e6eef2",
        width: "100%",
        boxSizing: "border-box",
        fontSize: 14,
      }}
    />
  );
}
