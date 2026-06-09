import React from 'react';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <div className="topbar">
      <div id="topbar-breadcrumb" className="topbar-breadcrumb">
        <b>Dashboard</b>
      </div>
      <div className="topbar-right">
        <div className="search-wrap">
          <i className="fas fa-magnifying-glass" style={{ color: 'var(--text3)', fontSize: '12px' }}></i>
          <input type="text" placeholder="Search tasks, people…" />
        </div>
        <div className="notif-btn" title="Notifications">
          <i className="fas fa-bell"></i>
          <div className="notif-dot"></div>
        </div>
        <Avatar 
          initials={user?.avatar?.initials || user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          bg={user?.avatar?.bg || '#EEF2FF'}
          color={user?.avatar?.color || '#4F46E5'}
          size="sm"
          style={{ cursor: 'pointer' }}
          title="Profile"
        />
      </div>
    </div>
  );
};

export default Topbar;
