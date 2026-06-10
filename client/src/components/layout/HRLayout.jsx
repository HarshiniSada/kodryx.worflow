import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const NAV = [
  { section: 'Main' },
  { id: 'overview', label: 'Dashboard', icon: 'fa-grid-2', path: '/hr' },
  { id: 'employees', label: 'Employees', icon: 'fa-users', path: '/hr/people' },
  { id: 'attendance', label: 'Attendance', icon: 'fa-calendar-check', path: '/hr/attendance' },
  { id: 'leave', label: 'Leave', icon: 'fa-umbrella-beach', path: '/hr/leaves', badge: 4 },
  { id: 'tracker', label: 'Work Tracker', icon: 'fa-list-check', path: '/hr/tracker' },
  { section: 'Finance' },
  { id: 'payroll', label: 'Payroll', icon: 'fa-money-bill-wave', path: '/hr/payroll' },
  { section: 'Insights' },
  { id: 'reports', label: 'Reports', icon: 'fa-chart-column', path: '/hr/reports' },
];

const TITLES = {
  '/hr': 'HR Dashboard',
  '/hr/people': 'People',
  '/hr/attendance': 'Attendance',
  '/hr/leaves': 'Leave Management',
  '/hr/tracker': 'Daily Work Tracker',
  '/hr/payroll': 'Payroll & Payslips',
  '/hr/reports': 'Reports & Analytics',
};

const NOTIF_ICON = {
  leave_request:  { bg: '#FCE7F3', color: '#9D174D', icon: 'fa-umbrella-beach' },
  wfh_request:    { bg: '#DBEAFE', color: '#1E40AF', icon: 'fa-house-laptop' },
  leave_approved: { bg: '#D1FAE5', color: '#065F46', icon: 'fa-circle-check' },
  leave_rejected: { bg: '#FEE2E2', color: '#991B1B', icon: 'fa-circle-xmark' },
  payslip:        { bg: '#DBEAFE', color: '#1E40AF', icon: 'fa-file-invoice-dollar' },
  attendance:     { bg: '#FEF3C7', color: '#92400E', icon: 'fa-clock' },
  default:        { bg: '#FEE2E2', color: '#991B1B', icon: 'fa-triangle-exclamation' },
};

const HRLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    api.get('/api/notifications').then(({ data }) => setNotifs(data || [])).catch(() => {});
    api.get('/api/leaves').then(({ data }) => {
      setPendingLeaves((data || []).filter(l => l.status === 'Pending').length);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.hr-notif')) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const title = TITLES[location.pathname] || 'HR Dashboard';
  const initials = user?.avatar?.initials || 'SA';
  const avBg = user?.avatar?.bg || '#FCE7F3';
  const avColor = user?.avatar?.color || '#9D174D';

  const isActive = (path) => (path === '/hr' ? location.pathname === '/hr' : location.pathname.startsWith(path));

  return (
    <div className="hr-shell">
      {/* Sidebar */}
      <div className="hr-sidebar">
        <div className="hr-sidebar-logo">
          <div className="hr-sidebar-logo-icon">W</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="hr-sidebar-logo-text">WorkFlow</span>
            <span className="hr-sidebar-badge">HR</span>
          </div>
        </div>
        <div style={{ padding: '12px 8px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#F9FAFB', borderRadius: '9px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{initials}</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>{user?.designation || 'HR Manager'}</div>
            </div>
          </div>
        </div>
        {NAV.map((item, i) =>
          item.section ? (
            <div key={`s-${i}`} className="hr-sb-section">{item.section}</div>
          ) : (
            <div key={item.id} className={`hr-nav-item ${isActive(item.path) ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <i className={`fas ${item.icon}`}></i><span>{item.label}</span>
              {item.id === 'leave' && pendingLeaves > 0 && <span className="hr-nav-badge">{pendingLeaves}</span>}
            </div>
          )
        )}
        <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: '1px solid #E5E7EB' }}>
          <div className="hr-nav-item" onClick={() => { logout(); navigate('/'); }}>
            <i className="fas fa-right-from-bracket"></i><span>Sign out</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="hr-main">
        <div className="hr-topbar">
          <div className="hr-topbar-title">{title}</div>
          <div className="hr-topbar-right">
            <div className="hr-search"><i className="fas fa-magnifying-glass" style={{ fontSize: '11px', color: '#9CA3AF' }}></i><input type="text" placeholder="Search employees…" /></div>
            <div className="hr-notif" onClick={() => setNotifOpen((o) => !o)} title="Notifications">
              <i className="fas fa-bell" style={{ fontSize: '15px' }}></i>
              {notifs.some((n) => !n.isRead) && <div className="hr-notif-dot"></div>}
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>{initials}</div>
          </div>
        </div>

        {/* Notifications panel */}
        <div className={`notif-panel ${notifOpen ? 'open' : ''}`} ref={panelRef} style={{ position: 'fixed', top: '54px', right: '24px' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Notifications</span>
            <span className="hr-badge hr-badge-pink">{notifs.filter((n) => !n.isRead).length} new</span>
          </div>
          {notifs.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>No notifications</div>
          ) : notifs.map((n) => {
            const ic = NOTIF_ICON[n.type] || NOTIF_ICON.default;
            return (
              <div key={n._id} className="notif-item">
                <div className="notif-icon" style={{ background: ic.bg, color: ic.color }}><i className={`fas ${ic.icon}`}></i></div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{n.title}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{n.message}</div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hr-content"><Outlet /></div>
      </div>
    </div>
  );
};

export default HRLayout;
