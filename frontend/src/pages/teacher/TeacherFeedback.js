import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, StarRating, Badge } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { formatDate, getAcademicYears } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './TeacherFeedback.module.css';

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
            {/* Rating Breakdown Bar Chart */}
            <div className={styles.summaryCard} style={{ gridColumn: 'span 2', flexDirection: 'column', alignItems: 'stretch' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-700)', marginBottom: 12 }}>Rating Distribution</h4>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={breakdownData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="star" type="category" tick={{ fontSize: 12 }} width={30} />
                  <Tooltip formatter={v => [v, 'Reviews']} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {breakdownData.map((_, i) => (
                      <Cell key={i} fill={['#ef4444','#f97316','#eab308','#22c55e','#1e3a8a'].reverse()[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={filters.academic_year}
            onChange={e => setFilters(p => ({ ...p, academic_year: e.target.value }))}>
            <option value="">All Academic Years</option>
            {getAcademicYears().map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className={styles.filterSelect} value={filters.semester}
            onChange={e => setFilters(p => ({ ...p, semester: e.target.value }))}>
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>

        {/* Feedback List */}
        {loading ? <LoadingSpinner text="Loading feedback..." /> : feedbacks.length === 0 ? (
          <EmptyState icon="💬" title="No feedback yet" description="Student feedback will appear here once submitted." />
        ) : (
          <div className={styles.feedbackGrid}>
            {feedbacks.map((f, i) => (
              <div key={f.id || i} className={styles.feedbackCard} style={{ animationDelay: `${i * 0.04}s` }}>
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
                          <div style={{ width: `${(v / 5) * 100}%`, background: v >= 4 ? 'var(--success-500)' : v >= 3 ? 'var(--gold-400)' : 'var(--error-500)' }} />
                        </div>
                        <span className={styles.ratingItemVal}>{v}/5</span>
                      </div>
                    ))}
                  </div>
                )}

                {f.comment && (
                  <div className={styles.feedbackComment}>
                    <span className={styles.commentQuote}>"</span>
                    <p>{f.comment}</p>
                  </div>
                )}

                <div className={styles.feedbackFooter}>
                  <span>{f.is_anonymous ? '👤 Anonymous' : '👤 Student'}</span>
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
