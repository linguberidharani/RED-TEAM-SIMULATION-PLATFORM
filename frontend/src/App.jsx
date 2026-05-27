import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage  from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage   from './pages/DevicesPage';
import SimulationPage from './pages/SimulationPage';
import LogsPage      from './pages/LogsPage';
import ReportsPage   from './pages/ReportsPage';
import HelpPage      from './pages/HelpPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="font-display text-accent text-sm animate-pulse">INITIALIZING...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={user ? <Navigate to="/welcome" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/welcome" replace /> : <RegisterPage />} />

      {/* Protected routes — all inside Layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/welcome" replace />} />
        <Route path="welcome"    element={<WelcomePage />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="devices"    element={<DevicesPage />} />
        <Route path="simulation" element={<SimulationPage />} />
        <Route path="logs"       element={<LogsPage />} />
        <Route path="reports"    element={<ReportsPage />} />
        <Route path="help"       element={<HelpPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}