import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar, StarRating } from '../../components/common/Common';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getScoreColor, getBadgeInfo, getAnnouncementStyle, truncate, formatDate } from '../../utils/helpers';
import styles from './StudentDashboard.module.css';

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
            <h2 className={styles.welcomeTitle}>Hello, {user?.name?.split(' ')[0]} 👋</h2>
            <p className={styles.welcomeSub}>Your voice helps faculty grow. Share feedback and contribute to academic excellence.</p>
            <div className={styles.welcomeActions}>
              <Link to="/student/teachers" className="btn btn-accent btn-sm">Rate a Teacher →</Link>
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
              <h3 className={styles.cardTitle}>🏆 Top Faculty in {user?.department}</h3>
              <Link to="/student/teachers" className={styles.viewAll}>View All →</Link>
            </div>
            {data?.top_teachers_in_department?.length > 0 ? (
              <div className={styles.teacherList}>
                {data.top_teachers_in_department.map((t, i) => {
                  const badgeInfo = getBadgeInfo(undefined);
                  return (
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
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="👩‍🏫" title="No faculty data yet" />
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Announcements */}
            {data?.announcements?.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle} style={{ marginBottom: 14 }}>📢 Announcements</h3>
                <div className={styles.announcementList}>
                  {data.announcements.map((a, i) => {
                    const st = getAnnouncementStyle(a.type);
                    return (
                      <div key={i} className={styles.announcementItem} style={{ borderLeftColor: st.border }}>
                        <span className={styles.announcementIcon}>{st.icon}</span>
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
                <h3 className={styles.cardTitle} style={{ marginBottom: 14 }}>🎯 Upcoming Events</h3>
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
              <h3 className={styles.cardTitle} style={{ marginBottom: 14 }}>Quick Actions</h3>
              <div className={styles.quickActions}>
                <Link to="/student/teachers" className={styles.quickAction}>
                  <span>⭐</span>
                  <span>Rate Faculty</span>
                </Link>
                <Link to="/student/my-feedbacks" className={styles.quickAction}>
                  <span>📋</span>
                  <span>My Reviews</span>
                </Link>
                <Link to="/student/teachers" className={styles.quickAction}>
                  <span>👩‍🏫</span>
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
