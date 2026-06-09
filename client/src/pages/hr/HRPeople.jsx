import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const HRPeople = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await api.get('/api/users');
      setTeam(data);
    } catch (error) {
      addToast('Failed to load employee list', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

  return (
    <div className="view active" id="view-hr-people">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>People Directory</div>
          <div className="section-sub">Manage all employee records</div>
        </div>
        <Button variant="primary" size="sm" icon="user-plus" onClick={() => addToast('Add employee modal not implemented', 'info')}>
          Add Employee
        </Button>
      </div>

      <div className="card">
        <table className="task-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map(member => (
              <tr key={member._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar initials={member.name.split(' ').map(n=>n[0]).join('').slice(0,2)} bg={member.avatar?.bg} color={member.avatar?.color} size="sm" />
                    <div style={{ fontWeight: 600 }}>{member.name}</div>
                  </div>
                </td>
                <td>{member.designation}</td>
                <td>{member.department}</td>
                <td>{member.status || 'Active'}</td>
                <td>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/hr/people/${member._id}`)}>View Profile</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRPeople;
