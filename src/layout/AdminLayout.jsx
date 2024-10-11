import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AuthRoleRequire from '@/components/router/Authrole';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/assets/icons/connect.svg';
import { LogOut } from 'lucide-react';
import Footer from '@/components/Footer';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useState } from 'react';

function AdminLayout() {
  const authContext = useAuth();
  const { user, role: userRole, handleSignOut } = authContext || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);
  return (
    <AuthRoleRequire role="admin">
      <div className='flex items-center justify-end p-2'>
        <nav className='flex items-center gap-4 p-4'>
          {userRole === 'admin' && <>
            <Link to='/admin/add' className={`font-bold transition-all ease-in-out hover:text-blue-300 ${location.pathname === '/admin/add' ? 'text-blue-500' : 'text-gray-500'}`}>Add Score</Link>
            <Link to='/admin/list' className={`font-bold transition-all ease-in-out hover:text-blue-300 ${location.pathname === '/admin/list' ? 'text-blue-500' : 'text-gray-500'}`}>View Score</Link></>}

          <button onClick={handleOpen} className=' text-red-500 hover:text-red-300 transition-all ease-in-out font-bold py-2 px-4 rounded'>
            <LogOut />
          </button>
        </nav>
      </div>

      <div className='flex items-center justify-center gap-4'>
        <img src={Logo} className='w-10 h-10 sm:w-[50px] sm:h-[50px] rounded-full' alt='profile' />
        <div className='flex flex-col items-center justify-center w-fit '>
          <h1 className='text-xl sm:text-2xl font-bold  text-black'>CONNECT HIRING</h1>
          <h3 className='text-md sm:text-lg font-normal -mt-1 primary-text'>SCORE SYSTEM</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex flex-col min-h-[80vh]'>
        <main className="max-w-[1300px] mx-auto w-full mt-6 md:mt-20 flex-grow">
          <Outlet />
        </main>
        <div className='flex justify-end'>
          <Footer />
        </div>
      </div>

      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>
          <h5 className="text-2xl font-bold">Are you sure?</h5>
        </DialogHeader>
        <DialogBody>
          Do you really want to logout?
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleSignOut}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </AuthRoleRequire>
  );
}

export default AdminLayout;
