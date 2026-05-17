import React from 'react';
import styles from './StatCard.module.css';

export default function StatCard({ icon, label, value, change, changeType = 'positive', iconBg, delay = 0 }) {
  return (
    <div className={styles.card} style={{ animationDelay: `${delay}s` }}>
      <div className={styles.top}>
        <div
          className={styles.iconWrap}
          style={{ background: iconBg || 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.18)' }}
        >
          <span className={styles.icon}>{icon}</span>
        </div>
        {change !== undefined && (
          <span className={`${styles.change} ${styles[changeType]}`}>
            {changeType === 'positive' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}