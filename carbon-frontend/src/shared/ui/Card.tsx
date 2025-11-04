import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--card)",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
        maxWidth: 860,
      }}
    >
      {children}
    </div>
  );
}
