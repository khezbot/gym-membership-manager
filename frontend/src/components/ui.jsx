// Reusable UI pieces so every screen shares the same look and states
// (matches the reusable components in the Figma prototype).

export const Page = ({ title, subtitle, children }) => (
  <main className="max-w-5xl mx-auto p-6">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    {subtitle && <p className="text-gray-600 mt-1 mb-6">{subtitle}</p>}
    {!subtitle && <div className="mb-6" />}
    {children}
  </main>
);

const ALERT_STYLES = {
  error: 'bg-red-50 text-red-800 border-red-300',
  success: 'bg-green-50 text-green-800 border-green-300',
  info: 'bg-blue-50 text-blue-800 border-blue-300',
};

export const Alert = ({ type = 'info', children, onClose }) =>
  children ? (
    <div role="alert" className={`border rounded p-3 mb-4 flex justify-between ${ALERT_STYLES[type]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold" aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  ) : null;

export const EmptyState = ({ title, message, action }) => (
  <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-10 text-gray-600">
    <p className="text-lg font-semibold text-gray-800">{title}</p>
    <p className="mt-1">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const BADGE_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-200 text-gray-700',
  inactive: 'bg-gray-200 text-gray-700',
};

export const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${BADGE_STYLES[status] || ''}`}>{status}</span>
);

const BTN = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

export const Button = ({ variant = 'primary', className = '', ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed ${BTN[variant]} ${className}`}
  />
);

export const Field = ({ label, error, ...props }) => (
  <label className="block mb-4">
    <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
    <input
      {...props}
      aria-invalid={!!error}
      className={`w-full p-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <span className="text-sm text-red-600">{error}</span>}
  </label>
);

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-AU') : '—');
export const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
