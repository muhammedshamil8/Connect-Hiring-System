import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/assets/icons/connect.svg';
import Footer from '@/components/Footer';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-screen">
      <div className="rounded-lg p-8 max-w-md w-full flex-grow bg-white">
        <div className="flex items-center justify-center gap-4 mt-20 mb-20 sm:mb-48">
          <img src={Logo} className="w-10 h-10 sm:w-[50px] sm:h-[50px] rounded-full" alt="NSS Logo" />
          <div className="flex flex-col items-center">
            <h1 className="text-xl sm:text-2xl font-bold primary-text">CONNECT HIRING</h1>
            <h3 className="text-md sm:text-lg font-normal primary-text -mt-1">SCORE SYSTEM</h3>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Page Not Found</h1>
        <p className="text-center text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="w-full primary-bg text-white py-2 rounded-full hover:bg-blue-950 transition-colors duration-200 font-semibold flex items-center justify-center"
        >
          Go Back Home
        </Link>
      </div>
      <div className="flex-1 flex justify-end">
        <Footer /> 
      </div>
    </div>
  );
}

export default NotFound;
