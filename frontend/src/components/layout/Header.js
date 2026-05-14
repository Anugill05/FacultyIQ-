import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

export default function Header({ onMenuToggle, title, subtitle }) {
  const { user } = useAuth();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <div className={styles.titleArea}>
          {title ? (
            <>
              <h1 className={styles.pageTitle}>{title}</h1>
              {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
            </>
          ) : (
            <>
              <p className={styles.greeting}>{getGreeting()},</p>
              <h1 className={styles.userName}>{user?.name?.split(' ')[0]} 👋</h1>
            </>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.userChip}>
          <div className={styles.avatar}>
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} />
              : <span>{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div className={styles.userMeta}>
            <span className={styles.name}>{user?.name}</span>
            <span className={styles.dept}>{user?.department || user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
