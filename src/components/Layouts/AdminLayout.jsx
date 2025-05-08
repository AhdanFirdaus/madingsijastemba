import { useState } from "react";
import Sidebar from "../Fragments/Sidebar"
import { FiMenu } from "react-icons/fi";
import Breadcrumb from "../Fragments/Breadcrumb";

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center p-4 sm:p-8">
          <button 
            className="md:hidden bg-rose-500 text-white p-2 rounded-md shadow-md hover:bg-rose-400 transition-colors duration-200 focus:outline-none mr-4"
            onClick={toggleSidebar}
          >
            <FiMenu size={20} />
          </button>
          <div className="flex-1">
            <Breadcrumb />
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          </div>
        </header>
        <div className="px-4 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}