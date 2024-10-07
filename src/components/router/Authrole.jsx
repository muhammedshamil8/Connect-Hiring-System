import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';

const AuthRoleRequire = ({ children }) => {
    const authContext = useAuth();
    const { user, role: userRole, handleSignOut } = authContext || {};
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user !== null) {
            if (!userRole) {
                handleSignOut();
                navigate('/login');
            }
            setLoading(false);
        } else {
            navigate('/login');
        }
    }, [user, userRole, navigate, handleSignOut]);

    if (loading) {
        return (
            <div className='fixed top-0 left-0 w-full h-full bg-white dark:bg-slate-900 flex items-center justify-center z-50'>
                <p className='text-center dark:text-white flex items-center justify-center font-semibold'>Loading...  <Loader className="animate-spin" /></p>
            </div>
        );
    }

    return userRole ? children : <Navigate to="/login" replace />;
};

export default AuthRoleRequire;
