import { useState } from 'react';
import Button from '../Elements/Button';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-10 right-10 z-50 bg-white">
      <div className="container mx-auto mt-5 px-6 py-3 border rounded-full">
        <div className="grid grid-cols-3 items-center">
          {/* Logo */}
          <div className="text-rose-600 font-semibold text-lg">
            <Link to="/" className="font-bold">Mading Sija Stembase</Link>
          </div>

          {/* Menu */}
          <div className="hidden md:flex justify-center gap-6">
            <Link to="/blog" className="text-gray-800 hover:text-rose-600">Blog</Link>
            <Link to="/about" className="text-gray-800 hover:text-rose-600">About</Link>
            <Link to="/contact" className="text-gray-800 hover:text-rose-600">Contact</Link>
          </div>

          {/* Button */}
          <div className="hidden md:flex justify-end">
            <Button color="rose" className='font-bold' onClick={handleLogin}>Masuk</Button>
          </div>

          {/* Hamburger */}
          <div className="md:hidden col-span-3 flex justify-end mt-2">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden mt-3 flex flex-col gap-4 bg-white p-4 rounded-lg shadow z-50">
            <Link to="/blog" className="text-gray-800 hover:text-rose-600">Blog</Link>
            <Link to="/about" className="text-gray-800 hover:text-rose-600">About</Link>
            <Link to="/contact" className="text-gray-800 hover:text-rose-600">Contact</Link>
            <Button color="rose" className='font-bold' onClick={handleLogin}>Masuk</Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
