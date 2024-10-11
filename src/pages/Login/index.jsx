import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader } from 'lucide-react';
import Footer from '@/components/Footer';
import Logo from '@/assets/icons/connect.svg';
import { useAutoAnimate } from '@formkit/auto-animate/react'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const authContext = useAuth();
    const { user } = authContext || {};
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

    useEffect(() => {
        if (user) {
            navigate('/admin/list');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email && !password) {
            setError('Please enter your email and password.');
            return;
        }
        if (!email) {
            setError('Please enter your email.');
            return;
        }
        if (!password) {
            setError('Please enter your password.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin/list');
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Failed to log in. Please check your email and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center  p-4 h-screen">
            <form onSubmit={handleLogin} className="rounded-lg p-8 max-w-md w-full flex-grow  bg-white" ref={parent}>
                <div className='flex items-center justify-center gap-4 mt-20 mb-20 sm:mb-48'>
                    <img src={Logo} className='w-10 h-10 sm:w-[50px] sm:h-[50px] rounded-full' alt='NSS Logo' />
                    <div className='flex flex-col items-center'>
                        <h1 className='text-xl sm:text-2xl font-bold text-black'>CONNECT HIRING</h1>
                        <h3 className='text-md sm:text-lg font-normal primary-text -mt-1'>SCORE SYSTEM</h3>
                    </div>
                </div>
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h1>
                {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">
                        Email Address
                    </label>
                    <div className="flex items-center border border-gray-300 p-3 rounded-full transition duration-200 hover:shadow-md">
                        <Mail className="text-gray-400 mr-2" size={20} />
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="w-full outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="password">
                        Password
                    </label>
                    <div className="flex items-center border border-gray-300 p-3 rounded-full transition duration-200 hover:shadow-md">
                        <Lock className="text-gray-400 mr-2" size={20} />
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            className="w-full outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password" 
                        />
                    </div>
                </div>
                <button
                    className="w-full primary-bg text-white py-2 rounded-full hover:bg-blue-950 transition-colors duration-200 font-semibold flex items-center justify-center disabled:opacity-50"
                    type='submit'
                    disabled={loading}
                >
                    {loading ? <Loader className="animate-spin" /> : 'Login'}
                </button>
            </form>
            <div className='flex-1 flex justify-end'>
                <Footer />
            </div>
        </div>
    );
};

export default Login;
