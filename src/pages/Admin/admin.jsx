import AdminLayout from '../../components/Layouts/AdminLayout';
import { Outlet } from 'react-router';

function Admin() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default Admin;