import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const DailyStatusEntry = () => {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    fetchTodayLog();
  }, []);

  const fetchTodayLog = async () => {
    try {
      setLoading(true);
      const dateStr = new Date().toISOString().split('T')[0];
      const { data } = await api.get(`/api/daily-status/my-status?date=${dateStr}`);
      setLog(data.length ? data[0] : null);
    } catch (error) {
      addToast('Failed to load today\'s status log', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!description || !hours) return;

    try {
      setIsSubmitting(true);
      await api.post('/api/daily-status', {
        date: new Date().toISOString().split('T')[0],
        taskUpdate: {
          description,
          hoursSpent: Number(hours),
          status
        }
      });
      addToast('Task added to today\'s log', 'success');
      setDescription('');
      setHours('');
      setStatus('In Progress');
      fetchTodayLog();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to add task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

  const isLocked = log?.isLocked;

  return (
    <div className="view active" id="view-daily-status">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Daily Status Log</div>
          <div className="section-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
        {isLocked && <Badge variant="warning"><i className="fas fa-lock"></i> Locked for edits</Badge>}
        {!isLocked && <Badge variant="success"><i className="fas fa-lock-open"></i> Open for edits (Locks at 6:00 PM)</Badge>}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="section-hdr">
            <div className="section-title">Log a Task</div>
          </div>
          {isLocked ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--warning)', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #F59E0B' }}>
              <i className="fas fa-clock" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
              <p>Today's log was automatically locked at 6:00 PM.</p>
              <p style={{ fontSize: '12px', marginTop: '6px' }}>You cannot add or edit tasks for today anymore. A new log will be created tomorrow.</p>
            </div>
          ) : (
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label className="form-label">Task Description</label>
                <textarea 
                  className="inp" 
                  rows="3" 
                  placeholder="What did you work on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Hours Spent</label>
                  <input 
                    type="number" 
                    className="inp" 
                    min="0.5" 
                    step="0.5" 
                    placeholder="e.g. 2.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="inp"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <Button type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add to Log'}
              </Button>
            </form>
          )}
        </div>

        <div className="card">
          <div className="section-hdr">
            <div className="section-title">Today's Entries</div>
            <Badge variant="neutral">{log?.tasks?.length || 0} tasks</Badge>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!log || log.tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                No tasks logged today yet.
              </div>
            ) : (
              log.tasks.map((task, idx) => (
                <div key={idx} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{task.description}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', whiteSpace: 'nowrap', marginLeft: '12px' }}>{task.hoursSpent} hrs</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'Blocked' ? 'danger' : 'info'}>
                      {task.status}
                    </Badge>
                    {!isLocked && (
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)' }} onClick={() => addToast('Delete not implemented', 'info')}>
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStatusEntry;
