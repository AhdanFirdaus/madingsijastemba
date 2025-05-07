import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import ErrorPage from './pages/404';

const router = createBrowserRouter([
  {
    path: "/",
    element: <h1 className='flex items-center justify-center min-h-screen text-2xl font-bold text-center'>Hello World</h1>,
    errorElement: <ErrorPage/>
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <RouterProvider router={router} />
  </StrictMode>,
)
