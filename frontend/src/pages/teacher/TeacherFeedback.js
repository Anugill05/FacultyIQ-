import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, StarRating, Badge } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { formatDate, getAcademicYears } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './TeacherFeedback.module.css';

const barColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'].reverse();

export default function TeacherFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ semester: '', academic_year: '' });

  useEffect(() => {
    setLoading(true);
    teacherAPI.getFeedbacks(filters)
      .then(res => {
        setFeedbacks(res.data.data.data || []);
        setStats(res.data.stats);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const breakdownData = stats?.rating_breakdown
    ? Object.entries(stats.rating_breakdown).map(([k, v]) => ({ star: `${k}★`, count: v }))
    : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: '#1a1f2e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 13,
          color: '#e2e8f0',
        }}>
          {payload[0].value} reviews
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout title="Student Feedback" subtitle="Reviews and ratings from your students">
      <div className={styles.page}>

        {/* Summary Cards */}
        {stats && (
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>⭐</div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryVal}>{stats.avg_rating}/5</span>
                <span className={styles.summaryLabel}>Average Rating</span>
              </div>
              <StarRating value={stats.avg_rating} />
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>💬</div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryVal}>{stats.total_reviews}</span>
                <span className={styles.summaryLabel}>Total Reviews</span>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className={styles.summaryCard} style={{ gridColumn: 'span 2', flexDirection: 'column', alignItems: 'stretch' }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                Rating Distribution
              </h4>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={breakdownData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="star" type="category" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.45)' }} width={30} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {breakdownData.map((_, i) => (
                      <Cell key={i} fill={barColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={filters.academic_year}
            onChange={e => setFilters(p => ({ ...p, academic_year: e.target.value }))}
          >
            <option value="">All Academic Years</option>
            {getAcademicYears().map(y => (
              <option key={y} value={y} style={{ background: '#1a1f2e', color: '#e2e8f0' }}>{y}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={filters.semester}
            onChange={e => setFilters(p => ({ ...p, semester: e.target.value }))}
          >
            <option value="">All Semesters</option>
            <option value="1" style={{ background: '#1a1f2e', color: '#e2e8f0' }}>Semester 1</option>
            <option value="2" style={{ background: '#1a1f2e', color: '#e2e8f0' }}>Semester 2</option>
          </select>
        </div>

        {/* Feedback List */}
        {loading ? (
          <LoadingSpinner text="Loading feedback..." />
        ) : feedbacks.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No feedback yet"
            description="Student feedback will appear here once submitted."
          />
        ) : (
          <div className={styles.feedbackGrid}>
            {feedbacks.map((f, i) => (
              <div
                key={f.id || i}
                className={styles.feedbackCard}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Top Row */}
                <div className={styles.feedbackCardTop}>
                  <div className={styles.feedbackMeta}>
                    <Badge variant="neutral">{f.subject}</Badge>
                    <Badge variant="primary">Sem {f.semester}</Badge>
                    <Badge variant="neutral">{f.academic_year}</Badge>
                  </div>
                  <div className={styles.feedbackRatingMain}>
                    <StarRating value={f.overall_rating} size="sm" />
                    <span className={styles.ratingNum}>{f.overall_rating}/5</span>
                  </div>
                </div>

                {/* Rating Breakdown */}
                {f.ratings && (
                  <div className={styles.ratingBreakdown}>
                    {Object.entries(f.ratings).map(([k, v]) => (
                      <div key={k} className={styles.ratingItem}>
                        <span className={styles.ratingItemLabel}>{k.replace(/_/g, ' ')}</span>
                        <div className={styles.ratingItemBar}>
                          <div
                            style={{
                              width: `${(v / 5) * 100}%`,
                              background: v >= 4
                                ? '#22c55e'
                                : v >= 3
                                ? '#fbbf24'
                                : '#ef4444',
                            }}
                          />
                        </div>
                        <span className={styles.ratingItemVal}>{v}/5</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment */}
                {f.comment && (
                  <div className={styles.feedbackComment}>
                    <span className={styles.commentQuote}>"</span>
                    <p>{f.comment}</p>
                  </div>
                )}

                {/* Footer */}
                <div className={styles.feedbackFooter}>
                  <span>{f.is_anonymous ? 'Anonymous' : 'Student'}</span>
                  <span>{formatDate(f.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}