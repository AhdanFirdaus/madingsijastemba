import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../api/axios';
import Input from '../components/Elements/Input';
import BtnAuth from '../components/Elements/BtnAuth';
import AuthLayout from '../components/Layouts/AuthLayout';
import Notification from '../components/Elements/Notification';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;

      // Validate user role
      if (!user.role) {
        throw new Error('User role not provided');
      }

      // Save token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setSuccess('Login successful! Redirecting...');
      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      bottomText="Don't have an account?"
      bottomLink="Sign up"
      bottomHref="/register"
    >

      <Notification message={error} type="error" />
      <Notification message={success} type="success" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Username"
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <BtnAuth type="submit" text="Sign in" />
      </form>
    </AuthLayout>
  );
}

export default Login;