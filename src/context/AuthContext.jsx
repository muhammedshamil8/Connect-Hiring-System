// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { Loader } from "lucide-react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);

        // Optional: Fetch role from custom claims
        // const idTokenResult = await fbUser.getIdTokenResult();
        // setRole(idTokenResult.claims.role || "");

      } else {
        setUser(null);
        // setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  /* ----------------- Loading Screen ----------------- */
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-50">
        <Loader size={32} className="animate-spin text-indigo-600 dark:text-white mb-3" />
        <p className="font-semibold text-gray-700 dark:text-gray-200">Authenticating...</p>
      </div>
    );
  }

  /* ----------------- Provider ----------------- */
  return (
    <AuthContext.Provider value={{ user, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
