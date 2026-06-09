import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const RECS = [
  { icon: 'fa-user-check', title: 'Reassign WF-218', desc: "Priya's task is 2d overdue. Consider assigning to Sam who has 60% workload.", color: 'var(--danger-bg)', textColor: 'var(--danger-text)' },
  { icon: 'fa-unlock', title: 'Unblock Lena', desc: 'Request finance data for fuel report. Estimated 30min to unblock WF-240.', color: 'var(--warning-bg)', textColor: 'var(--warning-text)' },
  { icon: 'fa-chart-line', title: 'Scale AI Research', desc: 'Project is behind. Recommend adding 1 ML engineer from Product Dev for 2 weeks.', color: 'var(--info-bg)', textColor: 'var(--info-text)' },
];

const AIInsights = () => {
  const [performers, setPerformers] = useState([]);

  useEffect(() => {
    api.get('/api/users').then(({ data }) => {
      const top = (data || [])
        .filter((m) => m.role === 'Employee' || m.role === 'Intern')
        .sort((a, b) => (b.workStats?.performance || 0) - (a.workStats?.performance || 0))
        .slice(0, 4);
      setPerformers(top);
    }).catch(() => {});
  }, []);

  return (
    <div className="view active" id="view-ai">
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div className="section-title" style={{ fontSize: '18px' }}>AI Insights</div>
          <Badge variant="brand"><i className="fas fa-wand-magic-sparkles"></i> Live</Badge>
        </div>
        <div className="section-sub">Powered by WorkFlow AI · Updated just now</div>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-hdr"><div className="section-title">Daily briefing</div><Badge variant="brand">AI generated</Badge></div>
        <div className="insight-row danger"><div className="insight-icon"><i className="fas fa-circle-exclamation"></i></div><div><strong>Critical:</strong> Priya Nair's WF-218 is 2 days overdue with no recent activity log. Recommend immediate follow-up or task reassignment.</div></div>
        <div className="insight-row warning"><div className="insight-icon"><i className="fas fa-triangle-exclamation"></i></div><div><strong>At risk:</strong> AI Research project is 45% complete against 60% expected timeline. Marcus Webb's model training has stalled — GPU quota may be an issue.</div></div>
        <div className="insight-row success"><div className="insight-icon"><i className="fas fa-check"></i></div><div><strong>Strong delivery:</strong> Product Dev and Client Success are ahead of schedule. Aiko Tanaka delivered the auth module 2 days early with zero bug reports.</div></div>
        <div className="insight-row info"><div className="insight-icon"><i className="fas fa-chart-line"></i></div><div><strong>Forecast:</strong> At current velocity, Operations project will complete by Jul 2 — 1 day ahead of deadline. Consider stretching scope or front-loading next quarter.</div></div>
      </div>

      <div className="two-col" style={{ marginBottom: '16px' }}>
        <div className="card">
          <div className="section-hdr"><div className="section-title">Risk signals</div></div>
          <table className="task-table" style={{ width: '100%' }}>
            <tbody>
              <tr><td>Lena Fischer — no log in 48h</td><td><Badge variant="danger">High risk</Badge></td></tr>
              <tr><td>AI Research sprint velocity −20%</td><td><Badge variant="warning">Medium</Badge></td></tr>
              <tr><td>3 tasks approaching deadline</td><td><Badge variant="warning">Medium</Badge></td></tr>
              <tr><td>Client Success team 91% capacity</td><td><Badge variant="info">Monitor</Badge></td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="section-hdr"><div className="section-title">Top performers</div></div>
          <div>
            {performers.map((m, i) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i === performers.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text3)', width: '20px', textAlign: 'center' }}>{i + 1}</div>
                <Avatar initials={m.avatar?.initials} bg={m.avatar?.bg} color={m.avatar?.color} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{m.designation}</div>
                </div>
                <Badge variant="success">{m.workStats?.performance}%</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-hdr"><div className="section-title">AI recommendations</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {RECS.map((r, i) => (
            <div key={i} className="card card-sm" style={{ background: r.color, borderColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.textColor, fontSize: '13px' }}>
                  <i className={`fas ${r.icon}`}></i>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: r.textColor }}>{r.title}</div>
              </div>
              <div style={{ fontSize: '12px', color: r.textColor, opacity: 0.85, lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
