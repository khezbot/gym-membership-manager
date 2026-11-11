import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance, { errorMessage } from '../axiosConfig';
import { Alert, Button, Field } from '../components/ui';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return setError('Please enter your email and password.');
    setBusy(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/api/auth/login', formData);
      login(data);
      navigate(data.role === 'admin' ? '/admin/requests' : '/plans');
    } catch (err) {
      setError(errorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded" noValidate>
        <h1 className="text-2xl font-bold mb-4 text-center">Log in</h1>
        <Alert type="error">{error}</Alert>
        <Field label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        <Field label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Button>
        <p className="text-sm text-center mt-4">
          New here? <Link to="/register" className="text-indigo-700 underline">Create a member account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
