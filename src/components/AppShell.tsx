import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Bell, Building2, ChevronDown, CircleDollarSign, ClipboardList, CreditCard, DoorOpen, GraduationCap, LayoutDashboard, LogOut, Menu, MessageSquareText, PieChart, Utensils, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../api/authApi';

const menus: Record<Role, { label: string; path: string; icon: typeof LayoutDashboard }[]> = {
  ADMIN: [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard }, { label: 'Rooms', path: '/admin/rooms', icon: DoorOpen }, { label: 'Students', path: '/admin/students', icon: GraduationCap }, { label: 'Allocations', path: '/admin/allocations', icon: ClipboardList }, { label: 'Fees & billing', path: '/admin/fees', icon: CircleDollarSign }, { label: 'Payments', path: '/admin/payments', icon: CreditCard }, { label: 'Mess menu', path: '/admin/mess', icon: Utensils }, { label: 'Attendance', path: '/admin/attendance', icon: Users }, { label: 'Complaints', path: '/admin/complaints', icon: MessageSquareText }, { label: 'Reports', path: '/admin/reports', icon: PieChart }, { label: 'User accounts', path: '/admin/users', icon: Users },
  ],
  WARDEN: [{ label: 'Overview', path: '/dashboard', icon: LayoutDashboard }, { label: 'Occupancy', path: '/warden/occupancy', icon: Building2 }, { label: 'Residents', path: '/warden/students', icon: GraduationCap }, { label: 'Allocations', path: '/warden/allocations', icon: ClipboardList }, { label: 'Complaints', path: '/warden/complaints', icon: MessageSquareText }, { label: 'Reports', path: '/warden/reports', icon: PieChart }],
  STUDENT: [{ label: 'Overview', path: '/dashboard', icon: LayoutDashboard }, { label: 'My room', path: '/student/room', icon: DoorOpen }, { label: 'My fees', path: '/student/fees', icon: CircleDollarSign }, { label: 'Payments', path: '/student/payments', icon: CreditCard }, { label: 'Mess menu', path: '/student/mess-menu', icon: Utensils }, { label: 'Meal attendance', path: '/student/attendance', icon: Users }, { label: 'Complaints', path: '/student/complaints', icon: MessageSquareText }],
  MESS_STAFF: [{ label: 'Overview', path: '/dashboard', icon: LayoutDashboard }, { label: 'Mess menu', path: '/mess/menu', icon: Utensils }, { label: 'Attendance', path: '/mess/attendance', icon: Users }, { label: 'Reports', path: '/mess/reports', icon: PieChart }],
};
const titles: Record<string, string> = { '/dashboard': 'Overview', '/profile': 'My profile', '/notifications': 'Notifications' };

export function AppShell() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const title = titles[location.pathname] ?? menus[user.role].find(item => item.path === location.pathname)?.label ?? 'Hostel management';
  const initials = user.fullName.split(' ').map(name => name[0]).slice(0, 2).join('').toUpperCase();
  return <div className="app-shell">
    {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Building2 size={21} strokeWidth={2.4} /></span><span>haven<span className="brand-dot">.</span><small>HOSTEL PORTAL</small></span><button className="icon-btn sidebar-dismiss" onClick={() => setOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav">{menus[user.role].map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.9} /><span>{label}</span>{label === 'Allocations' && <span className="nav-count">•</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✦</div><strong>Need a hand?</strong><span>Our team is here to help.</span><a href="mailto:support@haven.local">Contact support <span>↗</span></a></div><div className="account-menu"><NavLink to="/profile" className="profile-menu" onClick={() => setOpen(false)}><div className="avatar">{initials}</div><span className="profile-meta"><strong>{user.fullName}</strong><small>{user.role.replace('_', ' ')}</small></span></NavLink><button className="account-signout" onClick={() => void signOut()} aria-label="Sign out"><LogOut size={15}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumb"><span>Haven</span><span className="crumb-slash">/</span><strong>{title}</strong></div><div className="topbar-actions"><span className="today-label">Campus operations</span><NavLink to="/notifications" className="notification-btn" aria-label="Notifications"><Bell size={19} /><i /></NavLink><NavLink to="/profile" className="top-avatar" aria-label="Open profile">{initials}<ChevronDown size={13} /></NavLink></div></header>
      <div className="page-content"><Outlet /></div>
    </main>
  </div>;
}
