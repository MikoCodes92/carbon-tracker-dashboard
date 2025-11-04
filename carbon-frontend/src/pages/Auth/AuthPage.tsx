// src/pages/AuthPage.tsx
import React, { useState } from "react";
import { LoginForm } from "@features/auth/components/LoginForm";
import { SignupForm } from "@features/auth/components/SignupForm";
import { useAuth } from "@features/auth/hooks/useAuth";

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, isAuthenticated } = useAuth();

  const handleLoginSuccess = () => {
    console.log("Login successful!");
    // Redirect or handle successful login
  };

  const handleSignupSuccess = () => {
    console.log("Signup successful!");
    // Redirect or handle successful signup
  };

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  // If already authenticated, you might want to redirect
  if (isAuthenticated) {
    // You can redirect to dashboard or show a message
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          <h2>Already Signed In</h2>
          <p>You are already authenticated. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLogin ? (
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={handleSwitchToSignup}
        />
      ) : (
        <SignupForm
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </>
  );
};

export default AuthPage;
