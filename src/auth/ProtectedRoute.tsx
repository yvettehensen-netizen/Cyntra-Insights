import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { AUTH_LOGIN_PATH } from "./authPaths";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to={AUTH_LOGIN_PATH} replace />;
  }

  return <>{children}</>;
}
