import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Sidebar.module.css';

/* ── SVG Icons ───────────────────────────────────────────── */

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconTeachers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconStudents = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconWorkshops = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 2v4M16 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01" />
  </svg>
);

const IconPerformance = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconAchievements = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const IconAnnouncements = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    <path d="M18 8.5c0 0 1 1 1 3.5s-1 3.5-1 3.5" />
  </svg>
);

const IconProfile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconFeedback = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconMyFeedbacks = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

/* ── Nav Config ──────────────────────────────────────────── */

const navConfig = {
  admin: [
    { path: '/admin/dashboard',    Icon: IconDashboard,     label: 'Dashboard'     },
    { path: '/admin/teachers',     Icon: IconTeachers,      label: 'Teachers'      },
    { path: '/admin/students',     Icon: IconStudents,      label: 'Students'      },
    { path: '/admin/workshops',    Icon: IconWorkshops,     label: 'Workshops'     },
    { path: '/admin/performance',  Icon: IconPerformance,   label: 'Performance'   },
    { path: '/admin/achievements', Icon: IconAchievements,  label: 'Achievements'  },
    { path: '/admin/announcements',Icon: IconAnnouncements, label: 'Announcements' },
  ],
  teacher: [
    { path: '/teacher/dashboard',    Icon: IconDashboard,    label: 'Dashboard'   },
    { path: '/teacher/profile',      Icon: IconProfile,      label: 'My Profile'  },
    { path: '/teacher/performance',  Icon: IconPerformance,  label: 'Performance' },
    { path: '/teacher/feedback',     Icon: IconFeedback,     label: 'Feedback'    },
    { path: '/teacher/achievements', Icon: IconAchievements, label: 'Achievements'},
    { path: '/teacher/workshops',    Icon: IconWorkshops,    label: 'Workshops'   },
  ],
  student: [
    { path: '/student/dashboard',    Icon: IconDashboard,   label: 'Dashboard'    },
    { path: '/student/teachers',     Icon: IconTeachers,    label: 'Teachers'     },
    { path: '/student/feedback',     Icon: IconFeedback,    label: 'Give Feedback'},
    { path: '/student/my-feedbacks', Icon: IconMyFeedbacks, label: 'My Feedbacks' },
  ],
};

const roleLabels = { admin: 'Administrator', teacher: 'Faculty', student: 'Student' };

/* ── Component ───────────────────────────────────────────── */

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
          <div className={styles.logoMark}>
            <IconLogo />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>FacultyUp</span>
            <span className={styles.logoTagline}>LPU Platform</span>
          </div>
        </div>

        {/* User Card */}
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

        {/* Nav */}
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
              <span className={styles.navIcon}><item.Icon /></span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
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
            <span className={styles.logoutIcon}><IconLogout /></span>
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

      </aside>
    </>
  );
}