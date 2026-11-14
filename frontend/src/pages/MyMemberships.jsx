import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance, { errorMessage } from '../axiosConfig';
import { Page, Alert, EmptyState, StatusBadge, Button, formatDate, formatPrice } from '../components/ui';

// Member workflow, step 3: track the request and cancel if needed.
const MyMemberships = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    axiosInstance
      .get('/api/memberships/mine')
      .then(({ data }) => setItems(data))
      .catch((err) => setMsg({ type: 'error', text: errorMessage(err, 'Could not load memberships.') }))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (m) => {
    if (!window.confirm(`Cancel your ${m.plan ? m.plan.name : ''} membership?`)) return;
    try {
      const { data } = await axiosInstance.patch(`/api/memberships/${m._id}/cancel`);
      setItems(items.map((i) => (i._id === data._id ? data : i)));
      setMsg({ type: 'success', text: 'Membership cancelled.' });
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  return (
    <Page title="My memberships">
      <Alert type={msg.type || 'info'} onClose={() => setMsg({ type: '', text: '' })}>{msg.text}</Alert>
      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && (
        <EmptyState
          title="You don't have a membership yet"
          message="Pick a plan to send your first request."
          action={<Link to="/plans" className="text-indigo-700 underline font-semibold">Browse plans</Link>}
        />
      )}
      <div className="space-y-3">
        {items.map((m) => (
          <div key={m._id} className="bg-white shadow rounded p-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold">{m.plan ? m.plan.name : 'Plan removed'}</h2>
                <StatusBadge status={m.status} />
              </div>
              <p className="text-sm text-gray-600">
                {m.plan && `${formatPrice(m.plan.price)} · `}Starts {formatDate(m.startDate)}
                {m.endDate && ` · Ends ${formatDate(m.endDate)}`}
              </p>
              {m.adminNote && <p className="text-sm text-gray-700 mt-1">Note from staff: {m.adminNote}</p>}
            </div>
            {['pending', 'active'].includes(m.status) && (
              <Button variant="secondary" onClick={() => cancel(m)}>Cancel</Button>
            )}
          </div>
        ))}
      </div>
    </Page>
  );
};

export default MyMemberships;
