import type { FC } from "react";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { CalculatorPage } from "@pages/calculator";
import { AuthPage } from "@pages/Auth";
import { useAuth } from "@features/auth/hooks/useAuth";

const headerStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderBottom: "1px solid #eee",
  background: "white",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const navStyle: React.CSSProperties = {
  marginTop: 8,
};

const linkStyle: React.CSSProperties = {
  marginRight: 12,
  textDecoration: "none",
  color: "#1890ff",
  fontWeight: 500,
};

const mainStyle: React.CSSProperties = {
  padding: 0,
  minHeight: "calc(100vh - 80px)",
};

const App: FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <Router>
      <div>
        {isAuthenticated && (
          <header style={headerStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1 style={{ margin: 0, fontSize: "24px", color: "#2d3748" }}>
                Carbon Footprint Analyzer
              </h1>
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <span style={{ color: "#666" }}>Welcome, {user?.name}</span>
                <button
                  onClick={logout}
                  style={{
                    padding: "6px 12px",
                    background: "#ff4d4f",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
            <nav style={navStyle}>
              <Link to="/" style={linkStyle}>
                Calculator
              </Link>
              <Link to="/dashboard" style={linkStyle}>
                Dashboard
              </Link>
            </nav>
          </header>
        )}

        <main style={mainStyle}>
          <Routes>
            <Route
              path="/"
              element={<CalculatorPage /> /*!isAuthenticated ? <AuthPage /> :*/}
            />
            {/* <Route
              path="/"
              element={isAuthenticated ? <CalculatorPage /> : <AuthPage />}
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <div style={{ padding: "20px" }}>
                    Dashboard Coming Soon...
                  </div>
                ) : (
                  <AuthPage />
                )
              }
            /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
