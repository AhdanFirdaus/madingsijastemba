import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiTrash2, FiAlertCircle, FiCheckCircle, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Button from '../../components/Elements/Button';
import Modal from '../../components/Elements/Modal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [formError, setFormError] = useState('');
  const usersPerPage = 9;

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Gagal memuat daftar pengguna');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
      const response = await api.post('/users', formData);
      if (response.data.success) {
        setUsers([...users, response.data.user]);
        setSuccess('Pengguna berhasil dibuat');
        setTimeout(() => setSuccess(''), 3000);
        setIsModalOpen(false);
        setFormData({ username: '', email: '', password: '', role: 'user' });
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Gagal membuat pengguna');
    }
  };

  // Handle role update
  const handleRoleChange = async (userId, newRole) => {
    try {
      setError('');
      setSuccess('');
      const response = await api.put('/users', { id: userId, role: newRole });
      if (response.data.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setSuccess('Peran pengguna berhasil diperbarui');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memperbarui peran');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle user deletion
  const handleDelete = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    try {
      setError('');
      setSuccess('');
      const response = await api.delete('/users', { data: { id: userId } });
      if (response.data.success) {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        const totalPages = Math.ceil(updatedUsers.length / usersPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
        setSuccess('Pengguna berhasil dihapus');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menghapus pengguna');
      setTimeout(() => setError(''), 3000);
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Managements</h2>
          <Button onClick={() => setIsModalOpen(true)}>Create User</Button>
        </div>

        {error && (
          <div className="flex items-center bg-rose-100 text-rose-700 p-4 rounded-lg mb-6 animate-fade-in">
            <FiAlertCircle className="mr-2 text-xl" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center bg-green-100 text-green-700 p-4 rounded-lg mb-6 animate-fade-in">
            <FiCheckCircle className="mr-2 text-xl" />
            <span>{success}</span>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <FiLoader className="animate-spin text-rose-500 text-4xl" />
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            Tidak ada pengguna ditemukan
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

        {!loading && users.length > 0 && (
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
                {currentUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700">{user.id}</td>
                    <td className="py-4 px-6 text-gray-700">{user.username}</td>
                    <td className="py-4 px-6 text-gray-700">{user.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
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
                        hour12: false
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Hapus pengguna"
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
                  className={`p-2 rounded-full cursor-pointer ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-100'}`}
                >
                  <FiChevronLeft size={20} />
                </button>
                {pageNumbers.map(number => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`px-4 py-2 rounded-md cursor-pointer ${currentPage === number ? 'bg-rose-500 text-white' : 'text-rose-500 hover:bg-rose-100'}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full cursor-pointer ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-100'}`}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
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