import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { LoadingSpinner, EmptyState, Avatar, Badge, ScoreBar, StarRating } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getBadgeInfo, getScoreColor, formatDate, getAnnouncementStyle, truncate } from '../../utils/helpers';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import styles from './TeacherDashboard.module.css';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.dashboard()
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

  const ps = data?.performance_score;
  const radarData = ps ? [
    { subject: 'Teaching', A: ps.student_rating_score || 0 },
    { subject: 'Attendance', A: ps.attendance_score || 0 },
    { subject: 'Research', A: ps.achievement_score || 0 },
    { subject: 'Workshops', A: ps.workshop_score || 0 },
    { subject: 'Feedback', A: ps.feedback_sentiment_score || 0 },
  ] : [];

  const badgeInfo = getBadgeInfo(ps?.badge);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Welcome */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeLeft}>
            <h2 className={styles.welcomeTitle}>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
            <p className={styles.welcomeSub}>Track your performance, collect feedback, and grow professionally.</p>
            {data?.badges?.length > 0 && (
              <div className={styles.badgesRow}>
                {data.badges.map((b, i) => (
                  <div key={i} className={styles.badgeChip} style={{ background: `${b.color}18`, color: b.color }}>
                    {b.icon} {b.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.welcomeRight}>
            {ps ? (
              <div className={styles.scoreSummary}>
                <div className={styles.scoreCircle} style={{ '--score-color': getScoreColor(ps.overall_score) }}>
                  <svg viewBox="0 0 100 100" className={styles.scoreSvg}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * ps.overall_score / 100)}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
                  </svg>
                  <div className={styles.scoreInner}>
                    <strong>{ps.overall_score?.toFixed(1)}%</strong>
                    <small>{ps.grade}</small>
                  </div>
                </div>
                <div className={styles.scoreMeta}>
                  <p className={styles.scoreLabel}>Overall Score</p>
                  <div className={styles.badgePill} style={{ background: badgeInfo.bg, color: badgeInfo.color }}>
                    {badgeInfo.icon} {badgeInfo.label}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                    Rank #{ps.rank_in_department} in dept.
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.noScore}>Performance not assessed yet</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard icon="⭐" label="Average Rating" value={`${data?.feedback_stats?.avg_rating ?? 0}/5`} iconBg="#fef3c7" delay={0} />
          <StatCard icon="💬" label="Total Reviews" value={data?.feedback_stats?.total ?? 0} iconBg="#dbeafe" delay={0.1} />
          <StatCard icon="🏅" label="Achievements" value={data?.achievements?.length ?? 0} iconBg="#dcfce7" delay={0.2} />
          <StatCard icon="🎯" label="Workshops" value={data?.workshops_joined?.length ?? 0} iconBg="#ede9fe" delay={0.3} />
        </div>

        {/* Main Content */}
        <div className={styles.mainGrid}>
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Performance Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Radar name="Score" dataKey="A" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className={styles.scoreBarsList}>
                {[
                  { label: 'Student Rating', val: Math.round(ps?.student_rating_score || 0), color: '#2563eb' },
                  { label: 'Attendance', val: Math.round(ps?.attendance_score || 0), color: '#16a34a' },
                  { label: 'Achievements', val: Math.round(ps?.achievement_score || 0), color: '#d97706' },
                  { label: 'Workshops', val: Math.round(ps?.workshop_score || 0), color: '#7c3aed' },
                ].map(s => <ScoreBar key={s.label} label={s.label} value={s.val} color={s.color} />)}
              </div>
            </div>
          )}

          {/* Recent Feedbacks */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Recent Feedback</h3>
              <Link to="/teacher/feedback" className={styles.viewAll}>View All →</Link>
            </div>
            {data?.feedback_stats?.recent?.length > 0 ? (
              <div className={styles.feedbackList}>
                {data.feedback_stats.recent.map((f, i) => (
                  <div key={i} className={styles.feedbackItem}>
                    <div className={styles.feedbackTop}>
                      <StarRating value={f.overall_rating} size="sm" />
                      <span className={styles.feedbackRating}>{f.overall_rating}/5</span>
                      <span className={styles.feedbackSubject}>{f.subject}</span>
                    </div>
                    {f.comment && <p className={styles.feedbackComment}>{truncate(f.comment, 80)}</p>}
                    <span className={styles.feedbackDate}>{formatDate(f.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon="💬" title="No feedback yet" />}
          </div>

          {/* Upcoming Workshops */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Upcoming Workshops</h3>
              <Link to="/teacher/workshops" className={styles.viewAll}>Browse →</Link>
            </div>
            {data?.upcoming_workshops?.length > 0 ? (
              <div className={styles.workshopList}>
                {data.upcoming_workshops.map((w, i) => (
                  <div key={i} className={styles.workshopItem}>
                    <div className={styles.workshopDate}>
                      <span>{new Date(w.start_date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className={styles.workshopInfo}>
                      <span className={styles.workshopTitle}>{w.title}</span>
                      <span className={styles.workshopMeta}>{w.mode} · {w.points_awarded}pts</span>
                    </div>
                    <Link to="/teacher/workshops" className={styles.joinBtn}>Join</Link>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon="🎯" title="No upcoming workshops" />}
          </div>
        </div>

        {/* Announcements */}
        {data?.announcements?.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 16 }}>📢 Announcements</h3>
            <div className={styles.announcementsList}>
              {data.announcements.map((a, i) => {
                const st = getAnnouncementStyle(a.type);
                return (
                  <div key={i} className={styles.announcementItem} style={{ borderLeftColor: st.border }}>
                    <span>{st.icon}</span>
                    <div>
                      <strong style={{ fontSize: 14, color: 'var(--neutral-900)' }}>{a.title}</strong>
                      <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 2 }}>{truncate(a.content, 100)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
