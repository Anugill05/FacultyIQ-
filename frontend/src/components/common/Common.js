import React from 'react';
import styles from './Common.module.css';

export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  return (
    <div className={`${styles.spinnerWrap} ${styles[size]}`}>
      <div className={styles.spinner} />
      {text && <p className={styles.spinnerText}>{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className={styles.pageLoader}>
      <div className={styles.spinner} />
      <p className={styles.spinnerText}>Loading...</p>
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', description = '', action }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>{icon}</span>
      <h3 className={styles.emptyTitle}>{title}</h3>
      {description && <p className={styles.emptyDesc}>{description}</p>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange, total, perPage = 15 }) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages.push(i);
  }

  return (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>
        Showing {start}–{end} of {total}
      </span>
      <div className={styles.paginationBtns}>
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >←</button>
        {pages[0] > 1 && (
          <>
            <button className={styles.pageBtn} onClick={() => onPageChange(1)}>1</button>
            {pages[0] > 2 && <span className={styles.ellipsis}>…</span>}
          </>
        )}
        {pages.map(p => (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === page ? styles.activePage : ''}`}
            onClick={() => onPageChange(p)}
          >{p}</button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className={styles.ellipsis}>…</span>}
            <button className={styles.pageBtn} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >→</button>
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'primary' }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{children}</span>;
}

export function ScoreBar({ label, value, color }) {
  return (
    <div className={styles.scoreBar}>
      <div className={styles.scoreBarTop}>
        <span className={styles.scoreBarLabel}>{label}</span>
        <span className={styles.scoreBarValue} style={{ color }}>{value}%</span>
      </div>
      <div className={styles.scoreBarTrack}>
        <div
          className={styles.scoreBarFill}
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function StarRating({ value = 0, max = 5, size = 'md' }) {
  const stars = Array.from({ length: max }, (_, i) => {
    if (i + 1 <= value) return 'full';
    if (i + 0.5 <= value) return 'half';
    return 'empty';
  });

  return (
    <div className={`${styles.stars} ${styles[`stars_${size}`]}`}>
      {stars.map((type, i) => (
        <span key={i} className={`${styles.star} ${type !== 'empty' ? styles.starFilled : ''}`}>
          {type === 'full' ? '★' : type === 'half' ? '⭑' : '☆'}
        </span>
      ))}
    </div>
  );
}

export function Avatar({ name, src, size = 'md' }) {
  const initials = name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';
  const sizeMap = { sm: 32, md: 44, lg: 56, xl: 80 };
  const px = sizeMap[size] || 44;
  const fontSize = px * 0.38;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: px, height: px, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{
      width: px, height: px, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize,
      fontFamily: 'var(--font-body)',
    }}>
      {initials}
    </div>
  );
}
