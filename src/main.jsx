import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import ErrorPage from './Pages/404';
import Register from './Pages/register';
import Login from './Pages/login';
import Admin from './Pages/Admin/admin';
// import Statistic from './Pages/Admin/statistic';
import Articles from './Pages/Admin/articles';
import Comments from './Pages/Admin/comments';
import Users from './Pages/Admin/users';

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
    element: <Admin />,
    children: [
      // {
      //   path: 'statistic',
      //   element: <Statistic />,
      // },
      {
        path: 'articles',
        element: <Articles />,
      },
      {
        path: 'comments',
        element: <Comments />,
      },
      {
        path: 'users',
        element: <Users />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);