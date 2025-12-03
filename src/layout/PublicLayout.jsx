import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/assets/icons/connect.svg';
import Footer from '@/components/Footer';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <div className='flex items-center justify-end p-2'>
        <nav className='flex items-center gap-4 p-4'>
            <Link to='/ranklist' className={`font-bold transition-all ease-in-out hover:text-blue-300 ${location.pathname === '/ranklist' ? 'text-blue-500' : 'text-gray-500'}`}>Rank List</Link>
            <Link to='/viewdata' className={`font-bold transition-all ease-in-out hover:text-blue-300 ${location.pathname === '/viewdata' ? 'text-blue-500' : 'text-gray-500'}`}>View Score</Link>
        </nav>
      </div>

      <div className='flex items-center justify-center gap-4'>
        <img src={Logo} className='w-10 h-10 sm:w-[50px] sm:h-[50px] rounded-full' alt='profile' />
        <div className='flex flex-col items-center justify-center w-fit '>
          <h1 className='text-xl sm:text-2xl font-bold  primary-text'>CONNECT HIRING</h1>
          <h3 className='text-md sm:text-lg font-normal -mt-1 primary-text'>SCORE SYSTEM</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex flex-col min-h-[80vh]'>
        <main className="max-w-[1300px] mx-auto w-full mt-6 flex-grow">
          <Outlet />
        </main>
        <div className='flex justify-end'>
          <Footer />
        </div>
      </div>

      </>
  );
}

export default PublicLayout;
