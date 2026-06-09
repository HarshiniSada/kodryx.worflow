import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const HRPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const { data } = await api.get('/api/payroll');
      setPayrolls(data);
    } catch (error) {
      addToast('Failed to load payroll', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id) => {
    try {
      await api.post(`/api/payroll/${id}/process`);
      addToast('Payroll processed successfully', 'success');
      fetchPayroll();
    } catch (error) {
      addToast('Failed to process payroll', 'error');
    }
  };

  return (
    <div className="view active" id="view-hr-payroll">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Payroll Management</div>
        </div>
        <Button variant="primary" size="sm" icon="plus" onClick={() => addToast('Generate modal not implemented', 'info')}>
          Generate Payroll
        </Button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading...</div>
        ) : payrolls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>No payroll records found</div>
        ) : (
          <table className="task-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month/Year</th>
                <th>Basic Salary</th>
                <th>Total Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(pay => (
                <tr key={pay._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar initials={pay.employee?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)} size="sm" />
                      <div style={{ fontWeight: 600 }}>{pay.employee?.name}</div>
                    </div>
                  </td>
                  <td>{pay.month}/{pay.year}</td>
                  <td>${pay.basicSalary}</td>
                  <td>${pay.basicSalary + (pay.allowances || 0) - (pay.deductions || 0)}</td>
                  <td>
                    <Badge variant={pay.status === 'Processed' ? 'success' : 'warning'}>
                      {pay.status}
                    </Badge>
                  </td>
                  <td>
                    {pay.status === 'Draft' && (
                      <Button variant="ghost" size="sm" onClick={() => handleProcess(pay._id)}>Process</Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => addToast('View payslip modal', 'info')}>View</Button>
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

export default HRPayroll;
