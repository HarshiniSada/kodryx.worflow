import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const HRAttendance = () => {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/attendance?date=${date}`);
      setRecords(data);
    } catch (error) {
      addToast('Failed to load attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view active" id="view-hr-attendance">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Attendance Log</div>
        </div>
        <input 
          type="date" 
          className="inp" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: 'auto' }}
        />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading...</div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>No records for this date</div>
        ) : (
          <table className="task-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Work Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar initials={record.employee?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)} size="sm" />
                      <div style={{ fontWeight: 600 }}>{record.employee?.name}</div>
                    </div>
                  </td>
                  <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                  <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}</td>
                  <td>
                    <Badge variant={record.status === 'Present' ? 'success' : record.status === 'Late' ? 'warning' : 'danger'}>
                      {record.status}
                    </Badge>
                  </td>
                  <td>{record.workHours ? `${record.workHours}h` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HRAttendance;
