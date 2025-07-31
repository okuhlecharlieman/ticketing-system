'use client';
const Dashboard = ({ stats, notifications, onViewNotifications }) => (
  <div id="dashboard">
    <h2>Dashboard</h2>
    <p>{stats}</p>
    <div id="notifications">
      <span id="notification-bell" onClick={onViewNotifications}>🔔 <span id="notification-count">{notifications.length}</span></span>
      <div id="notification-list" style={{ display: 'none' }}>
        {notifications.map((n, i) => <p key={i}>{n.message} ({new Date(n.timestamp).toLocaleString()})</p>)}
      </div>
    </div>
  </div>
);

export default Dashboard;