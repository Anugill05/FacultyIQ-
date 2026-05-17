import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar, StarRating, Badge } from '../../components/common/Common';
import { studentAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import styles from './StudentMyFeedbacks.module.css';

/* ─── SVG Icons ──────────────────────────────────────────── */

const IconClipboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────── */

export default function StudentMyFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    studentAPI.getMyFeedbacks()
      .then(res => setFeedbacks(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const avgGiven = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.overall_rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  return (
    <DashboardLayout title="My Feedbacks" subtitle="All the feedback you have submitted">
      <div className={styles.page}>

        {/* Summary */}
        <div className={styles.summaryRow}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryIconWrap}><IconClipboard /></div>
            <div>
              <span className={styles.summaryVal}>{feedbacks.length}</span>
              <span className={styles.summaryLabel}>Feedbacks Given</span>
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryIconWrap}><IconStar /></div>
            <div>
              <span className={styles.summaryVal}>{avgGiven}</span>
              <span className={styles.summaryLabel}>Average Rating Given</span>
            </div>
          </div>
          <Link to="/student/feedback" className="btn btn-primary">+ Give More Feedback</Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your feedbacks..." />
        ) : feedbacks.length === 0 ? (
          <EmptyState
            title="No feedbacks given yet"
            description="Start rating your teachers to help them improve."
            action={<Link to="/student/teachers" className="btn btn-primary">Browse Teachers</Link>}
          />
        ) : (
          <div className={styles.feedbacksList}>
            {feedbacks.map((f, i) => (
              <div key={f.id} className={styles.feedbackCard} style={{ animationDelay: `${i * 0.05}s` }}>

                <div className={styles.feedbackLeft}>
                  <Avatar name={f.teacher?.name} src={f.teacher?.avatar} size="md" />
                  <div className={styles.teacherInfo}>
                    <Link to={`/student/teachers/${f.teacher?.id}`} className={styles.teacherName}>
                      {f.teacher?.name}
                    </Link>
                    <span className={styles.teacherDept}>{f.teacher?.department}</span>
                    <span className={styles.teacherDesig}>{f.teacher?.designation}</span>
                  </div>
                </div>

                <div className={styles.feedbackMiddle}>
                  <div className={styles.feedbackMeta}>
                    <Badge variant="neutral">{f.subject}</Badge>
                    <Badge variant="primary">Sem {f.semester}</Badge>
                    <Badge variant="neutral">{f.academic_year}</Badge>
                    {f.is_anonymous && <Badge variant="warning">Anonymous</Badge>}
                  </div>
                  {f.comment && (
                    <p className={styles.feedbackComment}>"{f.comment}"</p>
                  )}
                  {f.ratings && (
                    <div className={styles.ratingsRow}>
                      {Object.entries(f.ratings).map(([k, v]) => (
                        <span key={k} className={styles.ratingTag}>
                          {k.replace(/_/g, ' ')}: <strong>{v}/5</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.feedbackRight}>
                  <div className={styles.overallRating}>
                    <StarRating value={f.overall_rating} size="sm" />
                    <span className={styles.ratingNum}>{f.overall_rating}/5</span>
                  </div>
                  <span className={styles.feedbackDate}>{formatDate(f.created_at)}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}