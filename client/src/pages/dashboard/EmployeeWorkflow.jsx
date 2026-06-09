import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import AssignTaskModal from '../../components/modals/AssignTaskModal';
import {
  EMP_TASKS, PROD_DATA, TIMELINE_DATA, LOG_DATA, MONTH_OPTIONS,
  keyFromInitials, stVariant,
} from '../../data/prototypeData';

const WORK_STATUS_VARIANT = (s) =>
  s === 'Blocked' ? 'warning' : s === 'Overdue task' ? 'danger' : s === 'In review' ? 'info' : 'success';

const STAT_DEFS = [
  { type: 'Completed', label: 'Completed', icon: 'fa-circle-check', accent: 'var(--success)', sub: 'this month', empty: 'No completed tasks this month.' },
  { type: 'In progress', label: 'In progress', icon: 'fa-spinner', accent: 'var(--info)', sub: 'active now', empty: 'No tasks currently in progress.' },
  { type: 'Pending', label: 'Pending', icon: 'fa-clock', accent: 'var(--warning)', sub: 'awaiting start', empty: 'No pending tasks.' },
  { type: 'Upcoming', label: 'Upcoming', icon: 'fa-calendar-days', accent: 'var(--brand)', sub: 'scheduled', empty: 'No upcoming tasks scheduled.' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EmployeeWorkflow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [prodMonth, setProdMonth] = useState('jun');
  const [tlMonth, setTlMonth] = useState('jun');
  const [logMonth, setLogMonth] = useState('jun');
  const timelineRef = useRef(null);

  useEffect(() => {
    api.get(`/api/users/${id}`)
      .then(({ data }) => setEmployee(data))
      .catch(() => addToast('Failed to load employee details', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  // scroll timeline near "today" on month change
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const target = tlMonth === 'jun' ? (8 - 4) * 120 : 0;
    el.scrollLeft = Math.max(0, target);
  }, [tlMonth, employee]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading...</div>;
  if (!employee) return <div style={{ padding: '24px' }}>Employee not found</div>;

  const key = keyFromInitials(employee.avatar?.initials);
  const empTasks = EMP_TASKS[key] || [];
  const isOnLeave = employee.status === 'on-leave';
  const countOf = (s) => empTasks.filter((t) => t.status === s).length;
  const statValue = (t) => (t === 'Completed' ? (employee.workStats?.completed ?? 0) : countOf(t));

  const scrollTimeline = (dir) => timelineRef.current?.scrollBy({ left: dir * 330, behavior: 'smooth' });

  // --- Productivity ---
  const prod = PROD_DATA[prodMonth];
  const maxBar = Math.max(...prod.bars) || 1;

  // --- Timeline ---
  const tl = TIMELINE_DATA[tlMonth];
  const today = 8;
  const isCurrentMonth = tlMonth === 'jun';

  return (
    <div className="view active" id="view-employee">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left"></i> Back
      </button>

      {/* Profile */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="emp-profile-top" style={{ marginBottom: 0 }}>
          <Avatar initials={employee.avatar?.initials} bg={employee.avatar?.bg} color={employee.avatar?.color} size="xl" />
          <div className="emp-profile-info">
            <div className="emp-profile-name">{employee.name}</div>
            <div className="emp-profile-role">{employee.designation} · {employee.department}</div>
            <div className="emp-profile-meta">
              <div className="emp-profile-meta-item"><i className="fas fa-envelope"></i> {employee.email}</div>
              <div className="emp-profile-meta-item"><i className="fas fa-sitemap"></i> Reports to Riya Kapoor</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {employee.workStatus && <Badge variant={WORK_STATUS_VARIANT(employee.workStatus)}>{employee.workStatus}</Badge>}
              {isOnLeave
                ? <Badge variant="danger"><i className="fas fa-umbrella-beach" style={{ fontSize: '10px' }}></i> On Leave Today</Badge>
                : <Badge variant="success"><i className="fas fa-circle-check" style={{ fontSize: '10px' }}></i> Available Today</Badge>}
            </div>
          </div>
          <Button variant="primary" size="sm" icon="plus" onClick={() => setShowAssign(true)}>Assign task</Button>
        </div>
      </div>

      {/* 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {STAT_DEFS.map((c) => {
          const open = activePanel === c.type;
          return (
            <div key={c.type} className="stat-card" style={{ cursor: 'pointer' }}
              onClick={() => setActivePanel(open ? null : c.type)}>
              <div className="stat-card-accent" style={{ background: c.accent }}></div>
              <div className="stat-label">
                <i className={`fas ${c.icon}`} style={{ color: c.accent }}></i> {c.label}
                <i className={`fas fa-chevron-down chevron-toggle ${open ? 'open' : ''}`} style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
              </div>
              <div className="stat-value">{statValue(c.type)}</div>
              <div className="stat-delta delta-neutral">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Stat detail panel */}
      {activePanel && (() => {
        const cfg = STAT_DEFS.find((c) => c.type === activePanel);
        const filtered = empTasks.filter((t) => t.status === activePanel);
        return (
          <div className="card" style={{ marginBottom: '20px', borderTop: `3px solid ${cfg.accent}`, animation: 'fadeIn 0.2s ease' }}>
            <div className="section-hdr" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className={`fas ${cfg.icon}`} style={{ color: cfg.accent, fontSize: '15px' }}></i>
                <div className="section-title">{cfg.label} tasks</div>
                <Badge variant={stVariant(activePanel)}>{filtered.length}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}><i className="fas fa-xmark"></i> Close</Button>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: '13px' }}>
                <i className="fas fa-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>{cfg.empty}
              </div>
            ) : (
              <table className="task-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead><tr>
                  <th style={{ width: '38%' }}>Task title</th><th style={{ width: '18%' }}>Priority</th>
                  <th style={{ width: '16%' }}>Due date</th><th style={{ width: '18%' }}>Status</th><th style={{ width: '10%' }}>Action</th>
                </tr></thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={i}>
                      <td><div style={{ fontWeight: 500, fontSize: '13px' }}>{t.title}</div></td>
                      <td><Badge variant="neutral">Medium</Badge></td>
                      <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{t.due}</td>
                      <td><Badge variant={stVariant(t.status)}>{t.status}</Badge></td>
                      <td><button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setShowAssign(true)}><i className="fas fa-edit"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}><i className="fas fa-user" style={{ marginRight: '4px' }}></i>Assigned to <strong style={{ color: 'var(--text)' }}>{employee.name}</strong></div>
              {activePanel === 'In progress' && <div style={{ fontSize: '12px', color: 'var(--text2)' }}><i className="fas fa-gauge-high" style={{ marginRight: '4px', color: 'var(--info)' }}></i>Est. completion: <strong style={{ color: 'var(--text)' }}>2–3 days</strong></div>}
              {activePanel === 'Pending' && <div style={{ fontSize: '12px', color: 'var(--text2)' }}><i className="fas fa-hourglass" style={{ marginRight: '4px', color: 'var(--warning)' }}></i>Needs kickoff before: <strong style={{ color: 'var(--text)' }}>Jun 12</strong></div>}
              {activePanel === 'Completed' && <div style={{ fontSize: '12px', color: 'var(--success)' }}><i className="fas fa-trophy" style={{ marginRight: '4px' }}></i>Great work — all delivered on time</div>}
              {activePanel === 'Upcoming' && <div style={{ fontSize: '12px', color: 'var(--text2)' }}><i className="fas fa-calendar" style={{ marginRight: '4px', color: 'var(--brand)' }}></i>Next scheduled start: <strong style={{ color: 'var(--text)' }}>Jun 15</strong></div>}
            </div>
          </div>
        );
      })()}

      {/* Current tasks + Productivity */}
      <div className="two-col" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '16px' }}><div className="section-title">Current tasks</div></div>
          <div>
            {empTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i === empTasks.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{t.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginRight: '4px' }}>{t.due}</div>
                <Badge variant={stVariant(t.status)}>{t.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-hdr">
            <div className="section-title">Productivity</div>
            <select className="inp" style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: '12px' }} value={prodMonth} onChange={(e) => setProdMonth(e.target.value)}>
              {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '4px' }}>
            <div className="emp-stat"><div className="emp-stat-val">{prod.monthly}</div><div className="emp-stat-lbl">Tasks this month</div></div>
            <div className="emp-stat"><div className="emp-stat-val">{prod.weekly !== null ? prod.weekly : '–'}</div><div className="emp-stat-lbl">Tasks this week</div></div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', margin: '16px 0 8px', fontWeight: 600 }}>Weekly breakdown</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', width: '100%' }}>
            {prod.bars.map((v, i) => {
              const h = v > 0 ? Math.round((v / maxBar) * 64) + 6 : 4;
              const isToday = prodMonth === 'jun' && i === 0;
              const isWeekend = i === 5 || i === 6;
              const barBg = isWeekend ? 'var(--bg2)' : isToday ? 'var(--brand)' : 'var(--brand-light)';
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: v === 0 ? 'var(--text3)' : 'var(--text)' }}>{v > 0 ? v : ''}</div>
                  <div style={{ width: '100%', height: h + 'px', background: barBg, borderRadius: '5px 5px 0 0' }}></div>
                  <div style={{ fontSize: '10px', color: isWeekend ? 'var(--text3)' : 'var(--text2)' }}>{DAYS[i]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily activity timeline */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-hdr">
          <div><div className="section-title">Daily activity timeline</div><div className="section-sub">{MONTH_OPTIONS.find((m) => m.value === tlMonth)?.label}</div></div>
          <select className="inp" style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: '12px' }} value={tlMonth} onChange={(e) => setTlMonth(e.target.value)}>
            {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="timeline-container" style={{ margin: '0 16px' }}>
          <div className="timeline-arrow left" onClick={() => scrollTimeline(-1)}><i className="fas fa-chevron-left"></i></div>
          <div className="timeline-scroll" ref={timelineRef}>
            <div className="timeline-track">
              {Array.from({ length: tl.days }, (_, idx) => {
                const day = idx + 1;
                const isToday = isCurrentMonth && day === today;
                const isCompleted = tl.completed.includes(day);
                const isOngoing = tl.ongoing.includes(day);
                const isDelayed = tl.delayed.includes(day);
                const isUpcoming = tl.upcoming.includes(day);
                let cls = 'day-card';
                if (isToday) cls += ' today';
                else if (isDelayed) cls += ' delayed-day';
                else if (isCompleted && !isOngoing) cls += ' completed-day';
                const done = ((day * 7) % 3) + 1;
                const soon = ((day * 5) % 3) + 1;
                return (
                  <div key={day} className={cls}>
                    <div className="day-hdr">{tl.label}</div>
                    <div className="day-num">{day}{isToday && <span style={{ fontSize: '10px', verticalAlign: 'super', color: 'var(--brand)' }}>●</span>}</div>
                    {isCompleted && !isOngoing && <div className="day-dot-row"><span className="dot dot-green"></span>{done} done</div>}
                    {isOngoing && <div className="day-dot-row"><span className="dot dot-blue"></span>2 active</div>}
                    {isDelayed && <div className="day-dot-row"><span className="dot dot-red"></span>delayed</div>}
                    {isUpcoming && <div className="day-dot-row"><span className="dot dot-gray"></span>{soon} soon</div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="timeline-arrow right" onClick={() => scrollTimeline(1)}><i className="fas fa-chevron-right"></i></div>
        </div>
      </div>

      {/* Historical daily logs */}
      <div className="card">
        <div className="section-hdr">
          <div className="section-title">Historical daily logs</div>
          <select className="inp" style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: '12px' }} value={logMonth} onChange={(e) => setLogMonth(e.target.value)}>
            {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          {LOG_DATA[logMonth].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0', borderBottom: i === LOG_DATA[logMonth].length - 1 ? 'none' : '1px solid var(--border)' }}>
              <div style={{ minWidth: '60px', fontSize: '12px', fontWeight: 600, color: 'var(--brand)', marginTop: '2px' }}>{l.d}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, marginBottom: '6px' }}>{l.note}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="dot dot-green"></span>{l.done} done</span>
                  <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="dot dot-blue"></span>{l.prog} in progress</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AssignTaskModal isOpen={showAssign} onClose={() => setShowAssign(false)} prefillEmail={employee.email} />
    </div>
  );
};

export default EmployeeWorkflow;
