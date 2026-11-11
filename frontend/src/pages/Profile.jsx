import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance, { errorMessage } from '../axiosConfig';
import { Alert, Button, Field } from '../components/ui';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    axiosInstance
      .get('/api/auth/profile')
      .then(({ data }) => setFormData({ name: data.name, email: data.email, phone: data.phone || '', address: data.address || '' }))
      .catch((err) => setMsg({ type: 'error', text: errorMessage(err, 'Failed to load profile.') }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.put('/api/auth/profile', formData);
      login({ ...user, name: data.name, email: data.email, token: data.token });
      setMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err, 'Failed to update profile.') });
    }
  };

  if (loading) return <div className="text-center mt-20">Loading…</div>;
  const set = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  return (
    <div className="max-w-md mx-auto mt-16">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Your profile</h1>
        <Alert type={msg.type || 'info'} onClose={() => setMsg({ type: '', text: '' })}>{msg.text}</Alert>
        <Field label="Name" value={formData.name} onChange={set('name')} />
        <Field label="Email" type="email" value={formData.email} onChange={set('email')} />
        <Field label="Phone" value={formData.phone} onChange={set('phone')} />
        <Field label="Address" value={formData.address} onChange={set('address')} />
        <Button type="submit" className="w-full">Save profile</Button>
      </form>
    </div>
  );
};

export default Profile;
