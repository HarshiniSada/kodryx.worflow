import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const MyPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchMyPayslips();
  }, []);

  const fetchMyPayslips = async () => {
    try {
      const { data } = await api.get('/api/payroll/my-payroll');
      setPayslips(data);
    } catch (error) {
      addToast('Failed to load your payslips', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view active" id="view-my-payslips">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>My Payslips</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading...</div>
        ) : payslips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>You have no payslips</div>
        ) : (
          <table className="task-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Period</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map(pay => (
                <tr key={pay._id}>
                  <td style={{ fontWeight: 600 }}>{pay.month} {pay.year}</td>
                  <td>${pay.basicSalary}</td>
                  <td style={{ color: 'var(--success)' }}>+${pay.allowances || 0}</td>
                  <td style={{ color: 'var(--danger)' }}>-${pay.deductions || 0}</td>
                  <td style={{ fontWeight: 700 }}>${pay.basicSalary + (pay.allowances || 0) - (pay.deductions || 0)}</td>
                  <td>
                    <Badge variant={pay.status === 'Processed' ? 'success' : 'warning'}>
                      {pay.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="ghost" size="sm" icon="download" onClick={() => addToast('Download not implemented', 'info')}>Download</Button>
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

export default MyPayslips;
