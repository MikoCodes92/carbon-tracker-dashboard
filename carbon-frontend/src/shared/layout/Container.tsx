import React from "react";

/**
 * Simple responsive container with max width and padding.
 * Keeps layout consistent across pages/components.
 */
export const Container: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  );
};
