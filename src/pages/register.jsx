import { useState } from 'react';
import {useNavigate } from 'react-router';
import api from '../api/axios';
import Input from '../components/Elements/Input';
import BtnAuth from '../components/Elements/BtnAuth';
import AuthLayout from '../components/Layouts/AuthLayout';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Trim input values
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      const response = await api.post('/auth/register', { 
        username: trimmedUsername, 
        email: trimmedEmail, 
        password: trimmedPassword 
      });
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 2000); // Redirect ke login setelah 2 detik
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal');
    }
  };

  return (
    <AuthLayout 
      title="Sign up to your account"
      bottomText="Already have an account?"
      bottomLink="Sign in"
      bottomHref="/login"
    >
    
    {error && <p className="text-rose-500 text-center mb-4">{error}</p>}
    {success && <p className="text-green-500 text-center mb-4">{success}</p>}

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
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />

          <BtnAuth type="submit" text="Sign up" />
          </form>
    </AuthLayout>
  );
}

export default Register;