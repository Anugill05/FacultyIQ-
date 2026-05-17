import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { LoadingSpinner, EmptyState, Avatar, Badge, ScoreBar } from '../../components/common/Common';
import { adminAPI } from '../../services/api';
import { getBadgeInfo, getScoreColor, formatDate, getAnnouncementStyle } from '../../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import styles from './AdminDashboard.module.css';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#818cf8', '#4f46e5', '#7c3aed'];

const tooltipStyle = {
  borderRadius: '10px',
  border: '1px solid rgba(99,102,241,0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  fontSize: '13px',
  background: '#1a1f2e',
  color: '#e2e8f0',
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    </DashboardLayout>
  );

  const gradeData = data?.grade_distribution?.map(g => ({ name: g._id, value: g.count })) || [];
  const deptData = data?.department_performance?.map(d => ({
    name: d._id?.replace(' ', '\n'),
    score: Math.round(d.avg_score || 0),
  })) || [];

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <h2 className={styles.welcomeTitle}>Faculty Development Overview</h2>
            <p className={styles.welcomeSubtitle}>Monitor faculty performance, workshops, and institutional growth in real-time.</p>
          </div>
          <div className={styles.welcomeActions}>
            <Link to="/admin/performance" className="btn btn-primary btn-sm">Generate Report</Link>
            <Link to="/admin/workshops" className="btn btn-secondary btn-sm">Add Workshop</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard icon="👩‍🏫" label="Total Faculty" value={data?.stats?.total_teachers ?? '—'} iconBg="rgba(99,102,241,0.15)" delay={0} change="Active" changeType="positive" />
          <StatCard icon="🎓" label="Total Students" value={data?.stats?.total_students ?? '—'} iconBg="rgba(34,197,94,0.12)" delay={0.1} />
          <StatCard icon="🎯" label="Total Workshops" value={data?.stats?.total_workshops ?? '—'} iconBg="rgba(251,146,60,0.12)" delay={0.2} />
          <StatCard icon="📊" label="Avg Performance" value={`${data?.stats?.avg_performance ?? 0}%`} iconBg="rgba(139,92,246,0.12)" delay={0.3} change="This semester" changeType="positive" />
        </div>

        {/* Charts Row */}
        <div className={styles.chartsRow}>
          {/* Department Performance Bar Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Performance by Department</h3>
              <Badge variant="primary">This Semester</Badge>
            </div>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Avg Score']} />
                  <Bar dataKey="score" fill="#6366f1" radius={[5, 5, 0, 0]}>
                    {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="📊" title="No data yet" />}
          </div>

          {/* Grade Distribution Pie Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Grade Distribution</h3>
              <Badge variant="success">All Faculty</Badge>
            </div>
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={gradeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={4} dataKey="value" labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Faculty']} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="🏆" title="No grades yet" />}
          </div>

          {/* Workshop Stats */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Workshop Status</h3>
            </div>
            <div className={styles.workshopStats}>
              {[
                { label: 'Upcoming', count: data?.workshop_stats?.upcoming ?? 0, color: '#818cf8', icon: '📅' },
                { label: 'Ongoing',  count: data?.workshop_stats?.ongoing ?? 0,  color: '#fb923c', icon: '🔄' },
                { label: 'Completed',count: data?.workshop_stats?.completed ?? 0,color: '#4ade80', icon: '✅' },
              ].map(w => (
                <div key={w.label} className={styles.workshopStatItem}>
                  <div className={styles.workshopStatIcon} style={{ background: `${w.color}1a` }}>
                    {w.icon}
                  </div>
                  <div className={styles.workshopStatInfo}>
                    <span className={styles.workshopStatCount} style={{ color: w.color }}>{w.count}</span>
                    <span className={styles.workshopStatLabel}>{w.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <Link to="/admin/workshops" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                Manage Workshops →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className={styles.bottomRow}>
          {/* Top Performers */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>Top Performers</h3>
              <Link to="/admin/performance" className={styles.viewAll}>View All →</Link>
            </div>
            {data?.top_performers?.length > 0 ? (
              <div className={styles.performersList}>
                {data.top_performers.map((t, i) => {
                  const badgeInfo = getBadgeInfo(t.badge);
                  return (
                    <div key={t.id} className={styles.performerItem}>
                      <div className={styles.performerRank}>#{i + 1}</div>
                      <Avatar name={t.name} src={t.avatar} size="sm" />
                      <div className={styles.performerInfo}>
                        <span className={styles.performerName}>{t.name}</span>
                        <span className={styles.performerDept}>{t.department}</span>
                      </div>
                      <div className={styles.performerScore} style={{ color: getScoreColor(t.score) }}>
                        {t.score?.toFixed(1)}%
                      </div>
                      <div className={styles.performerBadge}
                        style={{ background: badgeInfo.bg, color: badgeInfo.color }}>
                        {badgeInfo.icon}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState icon="🏆" title="No data yet" description="Generate performance reports first" />}
          </div>

          {/* Recent Feedbacks */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>Recent Feedbacks</h3>
              <Link to="/admin/teachers" className={styles.viewAll}>View All →</Link>
            </div>
            {data?.recent_feedbacks?.length > 0 ? (
              <div className={styles.feedbackList}>
                {data.recent_feedbacks.map((f, i) => (
                  <div key={i} className={styles.feedbackItem}>
                    <div className={styles.feedbackRating}>
                      {'★'.repeat(Math.round(f.overall_rating))}
                      <span className={styles.feedbackRatingNum}>{f.overall_rating}</span>
                    </div>
                    <div className={styles.feedbackMeta}>
                      <span className={styles.feedbackTeacher}>{f.teacher?.name || 'Teacher'}</span>
                      <span className={styles.feedbackComment}>{f.comment || '—'}</span>
                    </div>
                    <span className={styles.feedbackDate}>{formatDate(f.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon="💬" title="No feedbacks yet" />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}