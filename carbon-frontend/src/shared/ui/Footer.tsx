// src/shared/ui/Footer/Footer.tsx
import React from "react";
import { motion } from "framer-motion";

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
        padding: "16px 0",
        marginTop: "auto",
        width: "100%",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
          <div
            style={{
              color: "#64748b",
              fontSize: "12px",
              lineHeight: "1.4",
              marginBottom: "8px",
            }}
          >
            <strong style={{ color: "#475569" }}>
              🌱 Carbon Footprint Analyzer
            </strong>{" "}
            • Made with 💚 for a sustainable future
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "8px",
            }}
          >
            <a
              href="https://www.epa.gov/climatechange"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#64748b",
                fontSize: "11px",
                textDecoration: "none",
              }}
            >
              Climate Resources
            </a>
            <a
              href="https://www.un.org/sustainabledevelopment/climate-change/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#64748b",
                fontSize: "11px",
                textDecoration: "none",
              }}
            >
              UN Goals
            </a>
            <a
              href="https://www.energy.gov/energy-saver"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#64748b",
                fontSize: "11px",
                textDecoration: "none",
              }}
            >
              Energy Tips
            </a>
          </div>

          <div
            style={{
              color: "#94a3b8",
              fontSize: "11px",
            }}
          >
            © {new Date().getFullYear()} • Committed to environmental awareness
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
