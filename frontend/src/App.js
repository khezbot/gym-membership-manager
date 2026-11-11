import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

// Temporary placeholders until the feature pages are built (GMM-7 to GMM-12)
const ComingSoon = ({ text }) => <p className="p-6 text-gray-600">{text}</p>;

const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/requests' : '/plans'} replace />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute role="member"><ComingSoon text="Plans – coming in GMM-9" /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute role="admin"><ComingSoon text="Membership requests – coming in GMM-11" /></ProtectedRoute>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;