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
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 md:px-6 md:py-3 border rounded-full mt-4 max-w-[90%] bg-white">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-rose-600 font-semibold text-lg">
            <Link to="/" className="font-bold">Mading Sija Stembase</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/blog" className="text-gray-800 hover:text-rose-600">Blog</Link>
            <Link to="/about" className="text-gray-800 hover:text-rose-600">About</Link>
            <Link to="/contact" className="text-gray-800 hover:text-rose-600">Contact</Link>
            <Button color="rose" className="font-bold" onClick={handleLogin}>Masuk</Button>
          </div>

          {/* Hamburger for Mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full mt-2 mx-7 sm:mx-9 bg-white border rounded-lg shadow-lg z-50">
            <div className="flex flex-col gap-4 p-4">
              <Link to="/blog" className="text-gray-800 hover:text-rose-600" onClick={() => setIsOpen(false)}>Blog</Link>
              <Link to="/about" className="text-gray-800 hover:text-rose-600" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/contact" className="text-gray-800 hover:text-rose-600" onClick={() => setIsOpen(false)}>Contact</Link>
              <Button color="rose" className="font-bold w-full text-center" onClick={() => { handleLogin(); setIsOpen(false); }}>Masuk</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;