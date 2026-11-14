import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance, { errorMessage } from '../axiosConfig';
import { Page, Alert, EmptyState, Button, Field, formatPrice } from '../components/ui';

const today = () => new Date().toISOString().slice(0, 10);

// Member workflow, step 1–2: browse active plans and request one.
const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [startDate, setStartDate] = useState(today());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axiosInstance
      .get('/api/plans')
      .then(({ data }) => setPlans(data))
      .catch((err) => setError(errorMessage(err, 'Could not load plans.')))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!startDate) return setError('Please choose a start date.');
    if (startDate < today()) return setError('Start date cannot be in the past.');
    try {
      await axiosInstance.post('/api/memberships', { planId: selected._id, startDate });
      setSuccess(`Request sent for ${selected.name}. Staff will review it shortly.`);
      setSelected(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <Page title="Membership plans" subtitle="Choose a plan and pick when you'd like to start.">
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>
        {success && (
          <>
            {success} <Link to="/my-memberships" className="underline font-semibold">View my memberships</Link>
          </>
        )}
      </Alert>

      {loading && <p>Loading plans…</p>}
      {!loading && plans.length === 0 && (
        <EmptyState title="No plans available yet" message="The gym hasn't published any plans. Please check back soon." />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p._id} className="bg-white shadow rounded p-5 flex flex-col">
            <h2 className="text-lg font-bold">{p.name}</h2>
            <p className="text-3xl font-bold text-indigo-700 my-2">{formatPrice(p.price)}</p>
            <p className="text-sm text-gray-500">{p.durationMonths} month{p.durationMonths > 1 ? 's' : ''}</p>
            <p className="text-gray-700 my-3 flex-1">{p.description}</p>
            <Button onClick={() => { setSelected(p); setError(''); setSuccess(''); }}>Join this plan</Button>
          </div>
        ))}
      </div>

      {selected && (
        <form onSubmit={submit} className="bg-white shadow-lg rounded p-6 mt-6 max-w-md border-t-4 border-indigo-600">
          <h2 className="text-xl font-bold mb-2">Join {selected.name}</h2>
          <p className="text-gray-600 mb-4">
            {formatPrice(selected.price)} for {selected.durationMonths} month(s). Payment is taken at the front desk once approved.
          </p>
          <Field label="Start date" type="date" min={today()} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <div className="flex gap-2">
            <Button type="submit">Send request</Button>
            <Button type="button" variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
          </div>
        </form>
      )}
    </Page>
  );
};

export default Plans;
