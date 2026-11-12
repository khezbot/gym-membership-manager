import { useEffect, useState } from 'react';
import axiosInstance, { errorMessage } from '../axiosConfig';
import { Page, Alert, EmptyState, formatPrice } from '../components/ui';

// Member view: browse the active plans the gym offers.
const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance
      .get('/api/plans')
      .then(({ data }) => setPlans(data))
      .catch((err) => setError(errorMessage(err, 'Could not load plans.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page title="Membership plans" subtitle="Compare the plans the gym currently offers.">
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

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
          </div>
        ))}
      </div>
    </Page>
  );
};

export default Plans;