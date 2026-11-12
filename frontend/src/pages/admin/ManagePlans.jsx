import { useEffect, useState } from 'react';
import axiosInstance, { errorMessage } from '../../axiosConfig';
import { Page, Alert, EmptyState, StatusBadge, Button, Field, formatPrice } from '../../components/ui';

const EMPTY = { name: '', description: '', durationMonths: '', price: '' };

const validate = (f) => {
  const e = {};
  if (!f.name.trim()) e.name = 'Plan name is required';
  const d = Number(f.durationMonths);
  if (!Number.isInteger(d) || d < 1 || d > 24) e.durationMonths = 'Enter 1–24 months';
  if (f.price === '' || Number(f.price) < 0 || Number.isNaN(Number(f.price))) e.price = 'Enter a price of 0 or more';
  return e;
};

// Admin workflow: create, edit, deactivate and delete membership plans.
const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get('/api/plans')
      .then(({ data }) => setPlans(data))
      .catch((err) => setMsg({ type: 'error', text: errorMessage(err, 'Could not load plans.') }))
      .finally(() => setLoading(false));
  }, []);

  const reset = () => { setForm(EMPTY); setEditing(null); setErrors({}); };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    const body = { ...form, durationMonths: Number(form.durationMonths), price: Number(form.price) };
    try {
      if (editing) {
        const { data } = await axiosInstance.put(`/api/plans/${editing}`, body);
        setPlans(plans.map((p) => (p._id === data._id ? data : p)));
        setMsg({ type: 'success', text: `Saved changes to ${data.name}.` });
      } else {
        const { data } = await axiosInstance.post('/api/plans', body);
        setPlans([...plans, data]);
        setMsg({ type: 'success', text: `Created ${data.name}.` });
      }
      reset();
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  const edit = (p) => {
    setEditing(p._id);
    setErrors({});
    setForm({ name: p.name, description: p.description || '', durationMonths: String(p.durationMonths), price: String(p.price) });
  };

  const toggleActive = async (p) => {
    try {
      const { data } = await axiosInstance.put(`/api/plans/${p._id}`, { isActive: !p.isActive });
      setPlans(plans.map((x) => (x._id === data._id ? data : x)));
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/api/plans/${p._id}`);
      setPlans(plans.filter((x) => x._id !== p._id));
      setMsg({ type: 'success', text: `Deleted ${p.name}.` });
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Page title="Manage plans" subtitle="Plans marked inactive are hidden from members.">
      <Alert type={msg.type || 'info'} onClose={() => setMsg({ type: '', text: '' })}>{msg.text}</Alert>
      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={submit} className="bg-white shadow rounded p-5 h-fit" noValidate>
          <h2 className="text-lg font-bold mb-3">{editing ? 'Edit plan' : 'New plan'}</h2>
          <Field label="Name" value={form.name} onChange={set('name')} error={errors.name} />
          <Field label="Description" value={form.description} onChange={set('description')} />
          <Field label="Duration (months)" type="number" min="1" max="24" value={form.durationMonths} onChange={set('durationMonths')} error={errors.durationMonths} />
          <Field label="Price (AUD)" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} error={errors.price} />
          <div className="flex gap-2">
            <Button type="submit">{editing ? 'Save changes' : 'Create plan'}</Button>
            {editing && <Button type="button" variant="secondary" onClick={reset}>Cancel</Button>}
          </div>
        </form>

        <div className="md:col-span-2">
          {loading && <p>Loading…</p>}
          {!loading && plans.length === 0 && (
            <EmptyState title="No plans yet" message="Create your first plan with the form." />
          )}
          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p._id} className="bg-white shadow rounded p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{p.name}</h3>
                    <StatusBadge status={p.isActive ? 'active' : 'inactive'} />
                  </div>
                  <p className="text-sm text-gray-600">{formatPrice(p.price)} · {p.durationMonths} month(s)</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => edit(p)}>Edit</Button>
                  <Button variant="secondary" onClick={() => toggleActive(p)}>{p.isActive ? 'Deactivate' : 'Activate'}</Button>
                  <Button variant="danger" onClick={() => remove(p)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ManagePlans;
