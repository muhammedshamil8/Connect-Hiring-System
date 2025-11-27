import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";

const AuthRoleRequire = ({ children }) => {
  const { user, loading } = useAuth(); // -> FIX: include loading from context

  // Still loading Firebase auth state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 flex flex-col items-center justify-center z-50">
        <Loader className="animate-spin text-indigo-600 dark:text-white mb-3" size={32} />
        <p className="font-semibold dark:text-white">Authenticating...</p>
      </div>
    );
  }

  // Not logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → allow page
  return children;
};

export default AuthRoleRequire;
