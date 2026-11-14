import { useEffect, useState, useCallback } from 'react';
import axiosInstance, { errorMessage } from '../../axiosConfig';
import { Page, Alert, EmptyState, StatusBadge, Button, formatDate } from '../../components/ui';

const FILTERS = ['pending', 'active', 'rejected', 'cancelled', ''];

// Admin side of the main workflow: review pending requests.
const MembershipRequests = () => {
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [rejecting, setRejecting] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    axiosInstance
      .get('/api/memberships', { params: status ? { status } : {} })
      .then(({ data }) => setItems(data))
      .catch((err) => setMsg({ type: 'error', text: errorMessage(err, 'Could not load requests.') }))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(load, [load]);

  const review = async (m, decision, adminNote) => {
    try {
      await axiosInstance.patch(`/api/memberships/${m._id}/review`, { decision, adminNote });
      setMsg({ type: 'success', text: `${m.member ? m.member.name : 'Member'}'s request was ${decision === 'approve' ? 'approved' : 'rejected'}.` });
      setRejecting(null);
      setNote('');
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  return (
    <Page title="Membership requests" subtitle="Approve or reject requests from members.">
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => setStatus(f)}
            className={`px-3 py-1 rounded-full text-sm border ${status === f ? 'bg-indigo-600 text-white' : 'bg-white'}`}
          >
            {f || 'all'}
          </button>
        ))}
      </div>
      <Alert type={msg.type || 'info'} onClose={() => setMsg({ type: '', text: '' })}>{msg.text}</Alert>
      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && (
        <EmptyState title={`No ${status || ''} requests`} message="Nothing to review right now." />
      )}

      {!loading && items.length > 0 && (
        <table className="w-full bg-white shadow rounded text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">Member</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Start</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m._id} className="border-t align-top">
                <td className="p-3">
                  {m.member ? m.member.name : '—'}
                  <div className="text-xs text-gray-500">{m.member && m.member.email}</div>
                </td>
                <td className="p-3">{m.plan ? m.plan.name : '—'}</td>
                <td className="p-3">{formatDate(m.startDate)}{m.endDate && <div className="text-xs text-gray-500">to {formatDate(m.endDate)}</div>}</td>
                <td className="p-3"><StatusBadge status={m.status} /></td>
                <td className="p-3">
                  {m.status === 'pending' && rejecting !== m._id && (
                    <div className="flex gap-2">
                      <Button variant="success" onClick={() => review(m, 'approve')}>Approve</Button>
                      <Button variant="danger" onClick={() => { setRejecting(m._id); setNote(''); }}>Reject</Button>
                    </div>
                  )}
                  {rejecting === m._id && (
                    <div>
                      <input
                        className="border rounded p-1 w-full mb-2"
                        placeholder="Reason (required)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button variant="danger" disabled={!note.trim()} onClick={() => review(m, 'reject', note)}>Confirm reject</Button>
                        <Button variant="secondary" onClick={() => setRejecting(null)}>Back</Button>
                      </div>
                    </div>
                  )}
                  {m.status !== 'pending' && m.adminNote && <span className="text-sm text-gray-600">{m.adminNote}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Page>
  );
};

export default MembershipRequests;
