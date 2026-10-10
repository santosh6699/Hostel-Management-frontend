import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const AppShell = lazy(() => import('./components/AppShell').then(module => ({ default: module.AppShell })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ModulePage = lazy(() => import('./pages/ModulePage').then(module => ({ default: module.ModulePage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

function Protected({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader"><span className="spinner" />Loading your workspace…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();
  return <Suspense fallback={<div className="screen-loader"><span className="spinner" />Loading your workspace…</div>}><Routes>
    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
    <Route element={<Protected><AppShell /></Protected>}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ModulePage title="My profile" kind="profile" />} />
      <Route path="/notifications" element={<ModulePage title="Notifications" kind="notifications" />} />
      <Route path="/admin/rooms" element={<Protected roles={['ADMIN']}><ModulePage title="Room management" kind="rooms" /></Protected>} />
      <Route path="/admin/students" element={<Protected roles={['ADMIN']}><ModulePage title="Students" kind="students" /></Protected>} />
      <Route path="/admin/allocations" element={<Protected roles={['ADMIN']}><ModulePage title="Room allocations" kind="allocations" /></Protected>} />
      <Route path="/admin/fees" element={<Protected roles={['ADMIN']}><ModulePage title="Fee records" kind="fees" /></Protected>} />
      <Route path="/admin/payments" element={<Protected roles={['ADMIN']}><ModulePage title="Payments" kind="payments" /></Protected>} />
      <Route path="/admin/complaints" element={<Protected roles={['ADMIN']}><ModulePage title="Complaints" kind="complaints" /></Protected>} />
      <Route path="/admin/reports" element={<Protected roles={['ADMIN']}><ModulePage title="Reports" kind="reports" /></Protected>} />
      <Route path="/admin/users" element={<Protected roles={['ADMIN']}><ModulePage title="User accounts" kind="users" /></Protected>} />
      <Route path="/admin/mess" element={<Protected roles={['ADMIN','MESS_STAFF']}><ModulePage title="Mess menu" kind="mess" /></Protected>} />
      <Route path="/admin/attendance" element={<Protected roles={['ADMIN','MESS_STAFF']}><ModulePage title="Meal attendance" kind="attendance" /></Protected>} />
      <Route path="/admin/settings" element={<Protected roles={['ADMIN']}><ModulePage title="Settings" kind="settings" /></Protected>} />
      <Route path="/warden/allocations" element={<Protected roles={['WARDEN']}><ModulePage title="Allocation requests" kind="allocations" /></Protected>} />
      <Route path="/warden/occupancy" element={<Protected roles={['WARDEN']}><ModulePage title="Hostel occupancy" kind="rooms" /></Protected>} />
      <Route path="/warden/students" element={<Protected roles={['WARDEN']}><ModulePage title="Residents" kind="students" /></Protected>} />
      <Route path="/warden/complaints" element={<Protected roles={['WARDEN']}><ModulePage title="Complaints" kind="complaints" /></Protected>} />
      <Route path="/warden/reports" element={<Protected roles={['WARDEN']}><ModulePage title="Operational reports" kind="reports" /></Protected>} />
      <Route path="/student/room" element={<Protected roles={['STUDENT']}><ModulePage title="My room" kind="room" /></Protected>} />
      <Route path="/student/fees" element={<Protected roles={['STUDENT']}><ModulePage title="My fees" kind="fees" /></Protected>} />
      <Route path="/student/payments" element={<Protected roles={['STUDENT']}><ModulePage title="Payment history" kind="payments" /></Protected>} />
      <Route path="/student/mess-menu" element={<Protected roles={['STUDENT']}><ModulePage title="Mess menu" kind="mess" /></Protected>} />
      <Route path="/student/attendance" element={<Protected roles={['STUDENT']}><ModulePage title="Meal attendance" kind="attendance" /></Protected>} />
      <Route path="/student/complaints" element={<Protected roles={['STUDENT']}><ModulePage title="My complaints" kind="complaints" /></Protected>} />
      <Route path="/mess/menu" element={<Protected roles={['MESS_STAFF']}><ModulePage title="Mess menu" kind="mess" /></Protected>} />
      <Route path="/mess/attendance" element={<Protected roles={['MESS_STAFF']}><ModulePage title="Meal attendance" kind="attendance" /></Protected>} />
      <Route path="/mess/reports" element={<Protected roles={['MESS_STAFF']}><ModulePage title="Mess reports" kind="reports" /></Protected>} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense>;
}
