import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const HROverview = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ headcount: 0, onLeave: 0, lateArrivals: 0, pendingReviews: 0 });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [usersRes, leavesRes, attendanceRes] = await Promise.all([
        api.get('/api/users').catch(() => ({ data: [] })),
        api.get('/api/leaves').catch(() => ({ data: [] })),
        api.get(`/api/attendance?date=${today}`).catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const leaves = leavesRes.data || [];
      const attendance = attendanceRes.data || [];

      const headcount = users.filter(u => u.status !== 'inactive').length;
      const onLeaveToday = leaves.filter(l => {
        if (l.status !== 'Approved') return false;
        return l.startDate <= today && l.endDate >= today;
      }).length;
      const lateArrivals = attendance.filter(a => a.isLate).length;
      const pending = leaves.filter(l => l.status === 'Pending');

      // Build upcoming birthdays/anniversaries from joiningDate
      const upcoming = users
        .filter(u => u.joiningDate)
        .map(u => {
          const join = new Date(u.joiningDate);
          const now = new Date();
          const thisYear = new Date(now.getFullYear(), join.getMonth(), join.getDate());
          const diff = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24));
          const years = now.getFullYear() - join.getFullYear();
          return { user: u, diff, years };
        })
        .filter(e => e.diff >= 0 && e.diff <= 14)
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 4);

      setStats({ headcount, onLeave: onLeaveToday, lateArrivals, pendingReviews: pending.length });
      setPendingLeaves(pending.slice(0, 5));
      setUpcomingEvents(upcoming);
    } catch (err) {
      addToast('Failed to load HR overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await api.put(`/api/leaves/${id}`, { status });
      addToast(`Leave request ${status.toLowerCase()}`, 'success');
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update leave', 'error');
    }
  };

  const dayLabel = (diff) => {
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  return (
    <div className="view active" id="view-hr-overview">
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
          HR Dashboard
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stat cards — real data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/hr/people')}>
          <div className="stat-card-accent" style={{ background: 'var(--brand)' }}></div>
          <div className="stat-label"><i className="fas fa-users" style={{ color: 'var(--brand)' }}></i> Total Headcount</div>
          <div className="stat-value">{loading ? '—' : stats.headcount}</div>
          <div className="stat-delta delta-neutral">active employees</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/hr/leaves')}>
          <div className="stat-card-accent" style={{ background: 'var(--warning)' }}></div>
          <div className="stat-label"><i className="fas fa-umbrella-beach" style={{ color: 'var(--warning)' }}></i> On Leave Today</div>
          <div className="stat-value">{loading ? '—' : stats.onLeave}</div>
          <div className="stat-delta delta-neutral">approved absences</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/hr/attendance')}>
          <div className="stat-card-accent" style={{ background: 'var(--danger)' }}></div>
          <div className="stat-label"><i className="fas fa-clock" style={{ color: 'var(--danger)' }}></i> Late Arrivals</div>
          <div className="stat-value">{loading ? '—' : stats.lateArrivals}</div>
          <div className="stat-delta delta-down">today's attendance</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/hr/leaves')}>
          <div className="stat-card-accent" style={{ background: 'var(--success)' }}></div>
          <div className="stat-label"><i className="fas fa-file-signature" style={{ color: 'var(--success)' }}></i> Pending Leaves</div>
          <div className="stat-value">{loading ? '—' : stats.pendingReviews}</div>
          <div className="stat-delta delta-neutral">awaiting approval</div>
        </div>
      </div>

      <div className="two-col">
        {/* Pending Leave Requests — real data */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '12px' }}>
            <div className="section-title">Pending Leave Requests</div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/hr/leaves')}>View all</Button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
          ) : pendingLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>
              No pending leave requests
            </div>
          ) : (
            pendingLeaves.map(leave => (
              <div key={leave._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar
                    initials={leave.employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    bg={leave.employee?.avatar?.bg}
                    color={leave.employee?.avatar?.color}
                    size="sm"
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{leave.employee?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      {leave.type} · {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleLeaveAction(leave._id, 'Approved')}>Approve</button>
                  <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleLeaveAction(leave._id, 'Rejected')}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Work Anniversaries */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '12px' }}>
            <div className="section-title">Upcoming Anniversaries</div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>
              No upcoming anniversaries in the next 14 days
            </div>
          ) : (
            upcomingEvents.map((ev, i) => (
              <div key={ev.user._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === upcomingEvents.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar initials={ev.user.avatar?.initials} bg={ev.user.avatar?.bg} color={ev.user.avatar?.color} size="sm" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{ev.user.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      {ev.years} year{ev.years !== 1 ? 's' : ''} · {dayLabel(ev.diff)}
                    </div>
                  </div>
                </div>
                <Badge variant="brand">Milestone</Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HROverview;
