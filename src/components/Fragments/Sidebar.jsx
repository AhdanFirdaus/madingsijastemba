import { FiX, FiBarChart2, FiFileText, FiMessageSquare, FiUsers, FiLogOut } from "react-icons/fi";
import { Link, useNavigate } from "react-router";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Statistic', path: '/admin/statistic', icon: <FiBarChart2 className="w-5 h-5" /> },
    { name: 'Articles', path: '/admin/articles', icon: <FiFileText className="w-5 h-5" /> },
    { name: 'Comments', path: '/admin/comments', icon: <FiMessageSquare className="w-5 h-5" /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    try {
      // Optional: Call backend logout endpoint if required
      // await api.post('/auth/logout');
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/login');
      
      // Close sidebar on mobile
      toggleSidebar();
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-slate-950/50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-rose-500 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col h-screen px-5 py-8 overflow-y-auto border-r rtl:border-r-0 rtl:border-l shadow-lg md:shadow-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-bold">Admin Mading</h1>
          <button 
            className="md:hidden text-white focus:outline-none p-2 rounded-md hover:bg-rose-400 transition-colors duration-200"
            onClick={toggleSidebar}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col justify-between flex-1 mt-6">
          <nav className="-mx-3 space-y-6">
            <div className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center px-3 py-2 text-white transition-colors duration-300 transform rounded-lg hover:bg-rose-400"
                  onClick={toggleSidebar}
                >
                  {item.icon}
                  <span className="mx-2 text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-white transition-colors duration-300 transform rounded-lg hover:bg-rose-400 cursor-pointer"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="mx-2 text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;