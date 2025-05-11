import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import ErrorPage from './Pages/404';
import Register from './Pages/register';
import Login from './Pages/login';
import Admin from './Pages/Admin/admin';
import Statistic from './Pages/Admin/statistic';
import Articles from './Pages/Admin/articles';
import Users from './Pages/Admin/users';


// ProtectedRoute Component to secure admin routes
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  let userRole = null;

  // Decode token to get user role (assuming JWT)
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  }

  // Check if user is authenticated and has admin role
  if (!token || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <h1 className='flex items-center justify-center min-h-screen text-2xl font-bold text-center'>Hello World</h1>,
    errorElement: <ErrorPage />,
  },
  {
    path: 'register',
    element: <Register />,
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="statistic" replace />,
      },
      {
        path: 'statistic',
        element: <ProtectedRoute><Statistic /></ProtectedRoute>,
      },
      {
        path: 'articles',
        element: <ProtectedRoute><Articles /></ProtectedRoute>,
      },
      {
        path: 'users',
        element: <ProtectedRoute><Users /></ProtectedRoute>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);