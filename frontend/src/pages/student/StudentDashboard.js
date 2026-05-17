import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar, StarRating } from '../../components/common/Common';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getScoreColor, getBadgeInfo, getAnnouncementStyle, truncate, formatDate } from '../../utils/helpers';
import styles from './StudentDashboard.module.css';

/* ─── SVG Icons ──────────────────────────────────────────── */

const IconTrophy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M7 4H17l-1 7a5 5 0 0 1-10 0L5 4z"/>
    <path d="M5 9H3a2 2 0 0 0 0 4h2"/><path d="M19 9h2a2 2 0 0 0 0 4h-2"/>
  </svg>
);

const IconBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconZap = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconClipboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────── */

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.dashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeLeft}>
            <h2 className={styles.welcomeTitle}>Welcome back, {user?.name?.split(' ')[0]}</h2>
            <p className={styles.welcomeSub}>Your voice helps faculty grow. Share feedback and contribute to academic excellence.</p>
            <div className={styles.welcomeActions}>
              <Link to="/student/teachers" className="btn btn-primary btn-sm">Rate a Teacher →</Link>
              <Link to="/student/my-feedbacks" className="btn btn-secondary btn-sm">My Feedbacks</Link>
            </div>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatVal}>{data?.feedbacks_given ?? 0}</span>
              <span className={styles.welcomeStatLabel}>Feedbacks Given</span>
            </div>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatVal}>{user?.department || '—'}</span>
              <span className={styles.welcomeStatLabel}>Department</span>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>

          {/* Top Teachers */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconTrophy /> Top Faculty in {user?.department}
              </h3>
              <Link to="/student/teachers" className={styles.viewAll}>View All →</Link>
            </div>

            {data?.top_teachers_in_department?.length > 0 ? (
              <div className={styles.teacherList}>
                {data.top_teachers_in_department.map((t, i) => (
                  <Link key={t.id} to={`/student/teachers/${t.id}`} className={styles.teacherItem}>
                    <div className={styles.teacherRank}>#{i + 1}</div>
                    <Avatar name={t.name} src={t.avatar} size="sm" />
                    <div className={styles.teacherInfo}>
                      <span className={styles.teacherName}>{t.name}</span>
                      <span className={styles.teacherDesig}>{t.designation}</span>
                    </div>
                    <div className={styles.teacherRight}>
                      <div className={styles.teacherScore} style={{ color: getScoreColor(t.score) }}>
                        {t.score?.toFixed(1)}%
                      </div>
                      <div className={styles.teacherRating}>
                        <StarRating value={t.avg_rating} size="sm" />
                        <span>{t.avg_rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No faculty data yet" />
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>

            {/* Announcements */}
            {data?.announcements?.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <IconBell /> Announcements
                </h3>
                <div className={styles.announcementList}>
                  {data.announcements.map((a, i) => {
                    const st = getAnnouncementStyle(a.type);
                    return (
                      <div key={i} className={styles.announcementItem} style={{ borderLeftColor: st.border }}>
                        <div>
                          <p className={styles.announcementTitle}>{a.title}</p>
                          <p className={styles.announcementBody}>{truncate(a.content, 80)}</p>
                          <span className={styles.announcementDate}>{formatDate(a.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Workshops */}
            {data?.upcoming_workshops?.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <IconCalendar /> Upcoming Events
                </h3>
                <div className={styles.workshopList}>
                  {data.upcoming_workshops.map((w, i) => (
                    <div key={i} className={styles.workshopItem}>
                      <div className={styles.workshopDate}>
                        {new Date(w.start_date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                      </div>
                      <div>
                        <p className={styles.workshopTitle}>{w.title}</p>
                        <p className={styles.workshopMeta}>{w.mode} · {w.venue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={styles.quickActionsCard}>
              <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <IconZap /> Quick Actions
              </h3>
              <div className={styles.quickActions}>
                <Link to="/student/teachers" className={styles.quickAction}>
                  <IconStar />
                  <span>Rate Faculty</span>
                </Link>
                <Link to="/student/my-feedbacks" className={styles.quickAction}>
                  <IconClipboard />
                  <span>My Reviews</span>
                </Link>
                <Link to="/student/teachers" className={styles.quickAction}>
                  <IconUsers />
                  <span>Browse Faculty</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}