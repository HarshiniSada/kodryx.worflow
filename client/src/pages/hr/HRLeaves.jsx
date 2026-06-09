import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const HRLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/api/leaves');
      setLeaves(data);
    } catch (error) {
      addToast('Failed to load leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/api/leaves/${id}`, { status });
      addToast(`Leave request ${status.toLowerCase()}`, 'success');
      fetchLeaves();
    } catch (error) {
      addToast('Failed to update leave status', 'error');
    }
  };

  return (
    <div className="view active" id="view-hr-leaves">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Leave Requests</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading...</div>
        ) : leaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>No leave requests</div>
        ) : (
          <table className="task-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar initials={leave.employee?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)} size="sm" />
                      <div style={{ fontWeight: 600 }}>{leave.employee?.name}</div>
                    </div>
                  </td>
                  <td>{leave.leaveType}</td>
                  <td>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>
                    <Badge variant={leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'danger' : 'warning'}>
                      {leave.status}
                    </Badge>
                  </td>
                  <td>
                    {leave.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button variant="success" size="sm" onClick={() => handleAction(leave._id, 'Approved')}>Approve</Button>
                        <Button variant="danger" size="sm" onClick={() => handleAction(leave._id, 'Rejected')}>Reject</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HRLeaves;
