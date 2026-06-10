import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmployeeOverview from '../employee/EmployeeOverview';

// progress -> color (mirrors prototype thresholds)
const progColor = (p) =>
  p === 100 ? 'var(--success)' : p >= 50 ? 'var(--info)' : p > 0 ? 'var(--warning)' : 'var(--text3)';

const Overview = () => {
  const { user } = useAuth();

  if (user?.role === 'Employee' || user?.role === 'Intern') {
    return <EmployeeOverview />;
  }
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showAttention, setShowAttention] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [people, setPeople] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openRows, setOpenRows] = useState({});

  useEffect(() => { fetchMeta(); }, []);
  useEffect(() => { fetchLogs(); }, [selectedDate]);

  const fetchMeta = async () => {
    try {
      const [p, u, t] = await Promise.all([
        api.get('/api/projects').catch(() => ({ data: [] })),
        api.get('/api/users').catch(() => ({ data: [] })),
        api.get('/api/tasks').catch(() => ({ data: [] })),
      ]);
      setProjects(p.data || []);
      setPeople(u.data || []);
      setTasks(t.data || []);
    } catch (err) { /* ignore */ }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/daily-status?date=${selectedDate}`);
      setLogs(data);
    } catch (err) {
      addToast('Failed to load status logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (idKey) =>
    setOpenRows((prev) => ({ ...prev, [idKey]: !prev[idKey] }));

  const handleEscalate = () => {
    addToast('Escalation sent to team members.', 'success');
    setShowAttention(false);
  };

  const attentionTasks = tasks.filter(
    (t) => t.status === 'Overdue' || t.status === 'Blocked'
  );

  const employees = people.filter(p => p.role === 'Employee' || p.role === 'Intern');
  const submittedIds = new Set(logs.map(l => (l.employee?._id || l.employee)?.toString()));
  const missingMembers = employees.filter(p => !submittedIds.has(p._id?.toString()));

  // Tracker summary across all member logs
  const allTasks = logs.flatMap((l) => l.tasks || []);
  const completed = allTasks.filter((t) => t.status === 'Completed').length;
  const inProgress = allTasks.filter((t) => t.status === 'In Progress').length;
  const notStarted = allTasks.filter((t) => t.status === 'Not Started').length;
  const avgProgress = allTasks.length
    ? Math.round(allTasks.reduce((a, t) => a + (t.progress || 0), 0) / allTasks.length)
    : 0;

  const isToday = new Date().toISOString().split('T')[0] === selectedDate;
  const dateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="view active" id="view-overview">
      {/* Greeting */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
          Good morning, {user?.name?.split(' ')[0]} 👋
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {' · '}{people.length} people · {projects.length} active projects
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="stat-card" onClick={() => navigate('/dashboard/projects')} style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: 'var(--brand)' }}></div>
          <div className="stat-label">
            <i className="fas fa-folder" style={{ color: 'var(--brand)' }}></i> Active projects
            <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-delta delta-up"><i className="fas fa-arrow-trend-up"></i> +1 this month</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/dashboard/team')} style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--success)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: 'var(--success)' }}></div>
          <div className="stat-label">
            <i className="fas fa-users" style={{ color: 'var(--success)' }}></i> Team members
            <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value">{people.length}</div>
          <div className="stat-delta delta-neutral">across all projects</div>
        </div>

        <div className="stat-card" onClick={() => setShowAttention(!showAttention)} style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--warning)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: 'var(--warning)' }}></div>
          <div className="stat-label">
            <i className="fas fa-triangle-exclamation" style={{ color: 'var(--warning)' }}></i> Needs attention
            <i className={`fas fa-chevron-${showAttention ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value">{attentionTasks.length}</div>
          <div className="stat-delta delta-down">overdue or blocked</div>
        </div>

        <div className="stat-card" onClick={() => setShowMissing(!showMissing)} style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = missingMembers.length > 0 ? 'var(--danger)' : 'var(--success)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: missingMembers.length > 0 ? 'var(--danger)' : 'var(--success)' }}></div>
          <div className="stat-label">
            <i className="fas fa-user-clock" style={{ color: missingMembers.length > 0 ? 'var(--danger)' : 'var(--success)' }}></i> Missing logs
            <i className={`fas fa-chevron-${showMissing ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value" style={{ color: missingMembers.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {missingMembers.length}
          </div>
          <div className={`stat-delta ${missingMembers.length > 0 ? 'delta-down' : 'delta-up'}`}>
            {missingMembers.length === 0 ? 'all submitted today' : `haven't submitted today`}
          </div>
        </div>
      </div>

      {/* Needs attention panel */}
      {showAttention && (
        <div style={{ marginBottom: '24px', animation: 'fadeIn 0.2s ease' }}>
          <div className="card" style={{ borderTop: '3px solid var(--warning)' }}>
            <div className="section-hdr" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-triangle-exclamation" style={{ color: 'var(--warning)', fontSize: '15px' }}></i>
                <div className="section-title">Needs attention</div>
                <Badge variant="warning">{attentionTasks.length} items</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAttention(false)}>
                <i className="fas fa-xmark"></i> Close
              </Button>
            </div>
            <table className="task-table" style={{ width: '100%' }}>
              <thead><tr><th>Task</th><th>Assignee</th><th>Project</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead>
              <tbody>
                {attentionTasks.map((t) => (
                  <tr key={t._id}>
                    <td><div className="task-title-cell">{t.title}</div><div className="task-id">{t.taskId}</div></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <Avatar initials={t.assignee?.avatar?.initials} bg={t.assignee?.avatar?.bg} color={t.assignee?.avatar?.color} size="sm" />
                        {t.assignee?.name?.split(' ')[0]} {t.assignee?.name?.split(' ')[1]?.[0]}.
                      </div>
                    </td>
                    <td><span style={{ fontSize: '12px', color: 'var(--text2)' }}>{t.project?.name}</span></td>
                    <td><Badge variant={t.priority === 'Urgent' ? 'danger' : 'warning'}>{t.priority}</Badge></td>
                    <td><Badge variant={t.status === 'Overdue' ? 'danger' : 'warning'}>{t.status}</Badge></td>
                    <td style={t.status === 'Overdue' ? { color: 'var(--danger)', fontWeight: 600 } : {}}>{t.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <Button variant="danger" size="sm" icon="paper-plane" onClick={handleEscalate}>Escalate both</Button>
              <Button variant="secondary" size="sm" icon="list-check" onClick={() => navigate('/dashboard/tasks')}>View all tasks</Button>
            </div>
          </div>
        </div>
      )}

      {/* Missing members panel */}
      {showMissing && missingMembers.length > 0 && (
        <div style={{ marginBottom: '24px', animation: 'fadeIn 0.2s ease' }}>
          <div className="card" style={{ borderTop: '3px solid var(--danger)' }}>
            <div className="section-hdr" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-user-clock" style={{ color: 'var(--danger)', fontSize: '15px' }}></i>
                <div className="section-title">Haven't submitted today</div>
                <Badge variant="danger">{missingMembers.length} members</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowMissing(false)}>
                <i className="fas fa-xmark"></i> Close
              </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {missingMembers.map(m => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg)' }}>
                  <Avatar initials={m.avatar?.initials} bg={m.avatar?.bg} color={m.avatar?.color} size="sm" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{m.designation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Team Status Tracker */}
      <div className="card">
        <div className="section-hdr" style={{ marginBottom: '20px' }}>
          <div>
            <div className="section-title" style={{ fontSize: '16px' }}>Daily Team Status Tracker</div>
            <div className="section-sub">{dateLabel} · Tasks refresh daily at 6:00 PM</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="date" className="inp" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }} />
            {isToday && <Badge variant="brand"><i className="fas fa-circle" style={{ fontSize: '7px' }}></i> Live</Badge>}
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          <div className="emp-stat" style={{ background: 'var(--success-bg)' }}>
            <div className="emp-stat-val" style={{ color: 'var(--success-text)' }}>{completed}</div>
            <div className="emp-stat-lbl">Completed</div>
          </div>
          <div className="emp-stat" style={{ background: 'var(--info-bg)' }}>
            <div className="emp-stat-val" style={{ color: 'var(--info-text)' }}>{inProgress}</div>
            <div className="emp-stat-lbl">In Progress</div>
          </div>
          <div className="emp-stat" style={{ background: 'var(--danger-bg)' }}>
            <div className="emp-stat-val" style={{ color: 'var(--danger-text)' }}>{notStarted}</div>
            <div className="emp-stat-lbl">Not Started</div>
          </div>
          <div className="emp-stat" style={{ background: 'var(--brand-light)' }}>
            <div className="emp-stat-val" style={{ color: 'var(--brand)' }}>{avgProgress}%</div>
            <div className="emp-stat-lbl">Avg progress</div>
          </div>
        </div>

        {/* Member rows (collapsible) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>
            <i className="fas fa-circle-notch fa-spin"></i> Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text3)' }}>
            No status logs found for this date.
          </div>
        ) : (
          logs.map((log) => {
            const m = log.employee || {};
            const t = log.tasks || [];
            const memberCompleted = t.filter((x) => x.status === 'Completed').length;
            const memberProgress = t.length
              ? Math.round(t.reduce((a, x) => a + (x.progress || 0), 0) / t.length) : 0;
            const statusColor = progColor(memberProgress);
            const overallStatus = memberProgress === 100 ? 'Completed' : memberProgress > 0 ? 'In Progress' : 'Not Started';
            const osBadge = memberProgress === 100 ? 'success' : memberProgress > 0 ? 'info' : 'neutral';
            const open = !!openRows[log._id];

            return (
              <div key={log._id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: '12px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'var(--bg)', cursor: 'pointer' }}
                  onClick={() => toggleRow(log._id)}>
                  <Avatar initials={m.avatar?.initials} bg={m.avatar?.bg} color={m.avatar?.color} size="md" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{m.designation} · {m.department}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: statusColor }}>{memberProgress}%</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>progress</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{memberCompleted}/{t.length}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>done</div>
                    </div>
                    <Badge variant={osBadge} className="" >
                      <span style={{ minWidth: '64px', textAlign: 'center', display: 'inline-block' }}>{overallStatus}</span>
                    </Badge>
                    <div style={{ width: '80px' }}>
                      <div className="progress"><div className="progress-fill" style={{ width: memberProgress + '%', background: statusColor }}></div></div>
                    </div>
                    <i className={`fas fa-chevron-down chevron-toggle ${open ? 'open' : ''}`} style={{ fontSize: '11px', color: 'var(--text3)' }}></i>
                  </div>
                </div>

                {/* Body */}
                {open && (
                  <div style={{ borderTop: '1px solid var(--border)', animation: 'fadeIn 0.15s ease' }}>
                    <table className="task-table" style={{ width: '100%' }}>
                      <thead><tr>
                        <th>Task</th><th style={{ width: '120px' }}>Status</th><th style={{ width: '100px' }}>Progress</th>
                        <th style={{ width: '120px' }}>Last update</th><th>Notes</th>
                      </tr></thead>
                      <tbody>
                        {t.map((task, i) => {
                          const stCls = task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'neutral';
                          const pColor = progColor(task.progress || 0);
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 500 }}>{task.task}</td>
                              <td><Badge variant={stCls}>{task.status}</Badge></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div className="progress" style={{ flex: 1, height: '6px' }}>
                                    <div className="progress-fill" style={{ width: (task.progress || 0) + '%', background: pColor }}></div>
                                  </div>
                                  <span style={{ fontSize: '11px', fontWeight: 600, color: pColor, minWidth: '28px' }}>{task.progress}%</span>
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{task.updated}</td>
                              <td style={{ fontSize: '12px', color: 'var(--text2)', fontStyle: 'italic' }}>{task.notes}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Overview;
