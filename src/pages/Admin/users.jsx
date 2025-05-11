import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { FiTrash2, FiAlertCircle, FiChevronLeft, FiChevronRight, FiSearch, FiLoader } from 'react-icons/fi';
import Button from '../../components/Elements/Button';
import Modal from '../../components/Elements/Modal';
import Notification from '../../components/Elements/Notification';
import debounce from 'lodash/debounce';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [formError, setFormError] = useState('');
  const usersPerPage = 10;
  const MINIMUM_LOADING_TIME = 500;

  // Fetch users with search and role filter
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();

      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (roleFilter) params.role = roleFilter;

      const response = await api.get('/users', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const elapsedTime = Date.now() - startTime;
      const remainingTime = MINIMUM_LOADING_TIME - elapsedTime;

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setUsers([]);
      setError(err.response?.data?.error || 'Failed to load user list');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users when searchQuery, roleFilter, or component mounts
  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter]);

  // Clear success/error messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page on search
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Handle role filter change
  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/users', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.data.success) {
        setUsers([...users, response.data.user]);
        setSuccess('User successfully created');
        setIsModalOpen(false);
        setFormData({ username: '', email: '', password: '', role: 'user' });
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create user');
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setError('');
      setSuccess('');
      const response = await api.put(
        '/users',
        { id: userId, role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setUsers(users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setSuccess('User role successfully updated');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  // Handle user deletion
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      setError('');
      setSuccess('');
      const response = await api.delete('/users', {
        data: { id: userToDelete.id },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.data.success) {
        const updatedUsers = users.filter((user) => user.id !== userToDelete.id);
        setUsers(updatedUsers);
        const totalPages = Math.ceil(updatedUsers.length / usersPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
        setSuccess('User successfully deleted');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold">User Management</h2>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search users..."
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={roleFilter}
              onChange={handleRoleChange}
              className="w-full sm:w-32 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="writer">Writer</option>
            </select>
            <Button onClick={() => setIsModalOpen(true)} color="green">
              Create User
            </Button>
          </div>
        </div>

        <Notification message={error} type="error" />
        <Notification message={success} type="success" />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
              <div className="animate-spin text-rose-500"><FiLoader size={40} /></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            {searchQuery || roleFilter
              ? 'No users found for your search or filter.'
              : 'No users available.'}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-rose-500 text-white top-0 z-10">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold">ID</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">Username</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">Email</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">Role</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">Date</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors animate-fade-in">
                    <td className="py-4 px-6 text-gray-700">{user.id}</td>
                    <td className="py-4 px-6 text-gray-700">{user.username}</td>
                    <td className="py-4 px-6 text-gray-700">{user.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition cursor-pointer"
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="writer">Writer</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {new Date(user.created_at).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => confirmDelete(user)}
                        className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete user"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center my-6 space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full cursor-pointer ${
                    currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-100'
                  }`}
                >
                  <FiChevronLeft size={20} />
                </button>
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`px-4 py-2 rounded-md cursor-pointer ${
                      currentPage === number ? 'bg-rose-500 text-white' : 'text-rose-500 hover:bg-rose-100'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full cursor-pointer ${
                    currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-100'
                  }`}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create User Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormError('');
            setFormData({ username: '', email: '', password: '', role: 'user' });
          }}
          title="Create New User"
        >
          <form onSubmit={handleCreateUser}>
            {formError && (
              <div className="flex items-center bg-rose-100 text-rose-700 p-3 rounded-md mb-4">
                <FiAlertCircle className="mr-2" />
                <span>{formError}</span>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="writer">Writer</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                color="rose"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" color="green">
                Create
              </Button>
            </div>
          </form>
        </Modal>

        {/* Confirm Delete User */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
          }}
          title="Confirm Delete User"
        >
          <div className="mb-4">
            Are you sure you want to delete user{' '}
            <strong>{userToDelete?.username}</strong>?
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              color="gray"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="rose"
              onClick={executeDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </Modal>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}