import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { errorMessage } from '../axiosConfig';
import { Alert, Button, Field } from '../components/ui';

const validate = ({ name, email, password }) => {
  const e = {};
  if (!name.trim()) e.name = 'Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
  if (password.length < 8) e.password = 'Password must be at least 8 characters';
  return e;
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(formData);
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      await axiosInstance.post('/api/auth/register', formData);
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(errorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  const set = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  return (
    <div className="max-w-md mx-auto mt-16">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded" noValidate>
        <h1 className="text-2xl font-bold mb-4 text-center">Become a member</h1>
        <Alert type="error">{serverError}</Alert>
        <Field label="Full name" value={formData.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" type="email" value={formData.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" type="password" value={formData.password} onChange={set('password')} error={errors.password} />
        <Button type="submit" variant="success" className="w-full">Create account</Button>
      </form>
    </div>
  );
};

export default Register;
