import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Sidebar.module.css';

const navConfig = {
  admin: [
    { path: '/admin/dashboard', icon: '▦', label: 'Dashboard' },
    { path: '/admin/teachers', icon: '👩‍🏫', label: 'Teachers' },
    { path: '/admin/students', icon: '🎓', label: 'Students' },
    { path: '/admin/workshops', icon: '🎯', label: 'Workshops' },
    { path: '/admin/performance', icon: '📊', label: 'Performance' },
    { path: '/admin/achievements', icon: '🏅', label: 'Achievements' },
    { path: '/admin/announcements', icon: '📢', label: 'Announcements' },
  ],
  teacher: [
    { path: '/teacher/dashboard', icon: '▦', label: 'Dashboard' },
    { path: '/teacher/profile', icon: '👤', label: 'My Profile' },
    { path: '/teacher/performance', icon: '📈', label: 'Performance' },
    { path: '/teacher/feedback', icon: '💬', label: 'Feedback' },
    { path: '/teacher/achievements', icon: '🏅', label: 'Achievements' },
    { path: '/teacher/workshops', icon: '🎯', label: 'Workshops' },
  ],
  student: [
    { path: '/student/dashboard', icon: '▦', label: 'Dashboard' },
    { path: '/student/teachers', icon: '👩‍🏫', label: 'Teachers' },
    { path: '/student/feedback', icon: '💬', label: 'Give Feedback' },
    { path: '/student/my-feedbacks', icon: '📋', label: 'My Feedbacks' },
  ],
};

const roleLabels = { admin: 'Administrator', teacher: 'Faculty', student: 'Student' };

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = navConfig[user?.role] || [];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🎓</div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>FacultyUp</span>
            <span className={styles.logoTagline}>LPU Platform</span>
          </div>
        </div>

        {/* User Info */}
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} />
              : <span>{getInitials(user?.name)}</span>
            }
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name}</p>
            <span className={styles.userRole}>{roleLabels[user?.role]}</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className={styles.nav}>
          <p className={styles.navSection}>Navigation</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Motivational + Logout */}
        <div className={styles.sidebarBottom}>
          <div className={styles.motivationCard}>
            <p className={styles.motivationText}>
              "Excellence is not a skill, it's an attitude."
            </p>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <span>⬡</span>
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
}
