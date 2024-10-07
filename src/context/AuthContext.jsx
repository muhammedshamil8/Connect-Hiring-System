// src/context/AuthContext.js
import  { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/config/firebase'; 
import { Loader } from 'lucide-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const idTokenResult = await user.getIdTokenResult();
          setRole(idTokenResult.claims.role || ''); 
        } catch (error) {
          console.error("Error getting user role:", error);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className='fixed top-0 left-0 w-full h-full bg-white dark:bg-slate-900 flex items-center justify-center z-50'>
        <p className='text-center dark:text-white flex items-center justify-center font-semibold'>Loading...  <Loader className="animate-spin" /></p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
