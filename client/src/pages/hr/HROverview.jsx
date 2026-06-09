import React from 'react';
import useAuth from '../../hooks/useAuth';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';

const HROverview = () => {
  const { user } = useAuth();

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label"><i className="fas fa-users" style={{ color: 'var(--brand)' }}></i> Total Headcount</div>
          <div className="stat-value">42</div>
          <div className="stat-delta delta-up">+3 this quarter</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="fas fa-umbrella-beach" style={{ color: 'var(--warning)' }}></i> On Leave Today</div>
          <div className="stat-value">2</div>
          <div className="stat-delta delta-neutral">View details</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="fas fa-clock" style={{ color: 'var(--danger)' }}></i> Late Arrivals</div>
          <div className="stat-value">4</div>
          <div className="stat-delta delta-down">-2 from yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="fas fa-file-signature" style={{ color: 'var(--success)' }}></i> Pending Reviews</div>
          <div className="stat-value">8</div>
          <div className="stat-delta delta-neutral">Performance cycle</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="section-hdr">
            <div className="section-title">Pending Leave Requests</div>
          </div>
          <div>
            {/* Mock Pending Leave */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar initials="JD" size="sm" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>John Doe</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Sick Leave • June 12 - June 14</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-success" style={{ padding: '4px 8px', fontSize: '11px' }}>Approve</button>
                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>Reject</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-hdr">
            <div className="section-title">Upcoming Birthdays & Anniversaries</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar initials="PN" bg="#FCE7F3" color="#9D174D" size="sm" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Priya Nair</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Birthday • Tomorrow</div>
                </div>
              </div>
              <Badge variant="brand">Send Wish</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar initials="AS" bg="#E0E7FF" color="#4338CA" size="sm" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Alex Smith</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>3 Year Anniversary • June 15</div>
                </div>
              </div>
              <Badge variant="success">Schedule milestone</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HROverview;
