import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { roleHome } from '../components/routing/RoleProtected';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const initialRole = searchParams.get('role') || 'Founding Team';
  const [role] = useState(initialRole);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Demo default
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getRoleTheme = (r) => {
    switch (r) {
      case 'Founding Team': return { icon: 'fa-crown', label: 'Founding Team' };
      case 'Employee': return { icon: 'fa-user-tie', label: 'Employee' };
      case 'Intern': return { icon: 'fa-graduation-cap', label: 'Intern' };
      case 'HR': return { icon: 'fa-people-group', label: 'HR' };
      default: return { icon: 'fa-user', label: 'User' };
    }
  };

  const theme = getRoleTheme(role);

  // Set default email for demo purposes based on role
  React.useEffect(() => {
    if (role === 'Founding Team') setEmail('riya@company.com');
    if (role === 'HR') setEmail('hr@company.com');
    if (role === 'Employee') setEmail('priya.nair@company.com');
    if (role === 'Intern') setEmail('alex.chen@company.com');
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password, role);
      navigate(roleHome(data.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active" id="page-login" style={{ flexDirection: 'column' }}>
      <div className="login-card">
        <div className="login-logo-row">
          <div className="login-logo-icon">W</div>
          <span className="login-logo-text">WorkFlow</span>
        </div>
        
        <div className="role-pill">
          <i className={`fas ${theme.icon}`} style={{ fontSize: '11px' }}></i> 
          <span>{theme.label}</span>
        </div>
        
        <div className="login-title">Welcome back</div>
        <div className="login-subtitle">Sign in to access your workspace</div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input 
              className="inp" 
              type="email" 
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="inp" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="login-error" style={{ display: 'block' }}>
              <i className="fas fa-triangle-exclamation"></i> {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary login-btn" 
            disabled={loading}
            style={{ justifyContent: 'center' }}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-arrow-right-to-bracket"></i>} 
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <p className="login-hint">
          <Link to="/" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
            <i className="fas fa-arrow-left"></i> Back to role select
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
