import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, Avatar, StarRating, ScoreBar, Badge } from '../../components/common/Common';
import { studentAPI } from '../../services/api';
import { getScoreColor, formatDate } from '../../utils/helpers';
import styles from './StudentTeacherProfile.module.css';

/* ─── SVG Icons ──────────────────────────────────────────── */

const IconGrad = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const IconFlask = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6m-3 0v6l-4 8h10L14 9V3"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────── */

export default function StudentTeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getTeacherProfile(id)
      .then(res => setData(res.data.data))
      .catch(() => navigate('/student/teachers'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <DashboardLayout title="Teacher Profile">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <LoadingSpinner text="Loading profile..." />
      </div>
    </DashboardLayout>
  );

  const { teacher, avg_rating, total_reviews, rating_breakdown, feedbacks, my_feedback } = data || {};
  const breakdownEntries = Object.entries(rating_breakdown || {}).reverse();
  const maxReviews = Math.max(...Object.values(rating_breakdown || { 1: 1 }));

  return (
    <DashboardLayout title="Teacher Profile">
      <div className={styles.page}>

        <button className={styles.backBtn} onClick={() => navigate('/student/teachers')}>
          ← Back to Directory
        </button>

        <div className={styles.profileGrid}>

          {/* ── Left Card ── */}
          <div className={styles.profileCard}>

            <div className={styles.profileTop}>
              <Avatar name={teacher?.name} src={teacher?.avatar} size="xl" />
              <div>
                <h1 className={styles.profileName}>{teacher?.name}</h1>
                <p className={styles.profileDesig}>{teacher?.designation}</p>
                <p className={styles.profileDept}>{teacher?.department}</p>
              </div>
            </div>

            <div className={styles.ratingHero}>
              <div className={styles.ratingBig}>{avg_rating?.toFixed(1) || '0.0'}</div>
              <div className={styles.ratingStars}>
                <StarRating value={avg_rating || 0} size="lg" />
                <span className={styles.reviewCount}>{total_reviews} reviews</span>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className={styles.ratingBreakdown}>
              {breakdownEntries.map(([star, count]) => (
                <div key={star} className={styles.breakdownRow}>
                  <span className={styles.breakdownStar}>{star}★</span>
                  <div className={styles.breakdownBar}>
                    <div style={{
                      width: maxReviews > 0 ? `${(count / maxReviews) * 100}%` : '0%',
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      height: '100%',
                      borderRadius: '999px',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                  <span className={styles.breakdownCount}>{count}</span>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoRowIcon}><IconGrad /></span>
                <span>{teacher?.qualification}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoRowIcon}><IconFlask /></span>
                <span>{teacher?.specialization || 'Not specified'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoRowIcon}><IconCalendar /></span>
                <span>{teacher?.experience_years || 0} years experience</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoRowIcon}><IconMail /></span>
                <span>{teacher?.email}</span>
              </div>
            </div>

            {my_feedback ? (
              <div className={styles.alreadyRated}>
                <span className={styles.alreadyRatedIcon}><IconCheckCircle /></span>
                <div>
                  <p className={styles.alreadyRatedTitle}>You've submitted feedback</p>
                  <StarRating value={my_feedback.overall_rating} size="sm" />
                </div>
              </div>
            ) : (
              <Link
                to={`/student/feedback?teacher_id=${id}&teacher_name=${encodeURIComponent(teacher?.name)}`}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Rate this Teacher →
              </Link>
            )}
          </div>

          {/* ── Right Panel ── */}
          <div className={styles.rightPanel}>

            {teacher?.bio && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>About</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.72, marginTop: 12 }}>
                  {teacher.bio}
                </p>
              </div>
            )}

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Student Reviews ({total_reviews})</h3>
              {feedbacks?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.25)' }}>
                  <p style={{ marginTop: 8, fontSize: 14 }}>No public reviews yet.</p>
                </div>
              ) : (
                <div className={styles.reviewsList}>
                  {feedbacks?.map((f, i) => (
                    <div key={i} className={styles.reviewItem}>
                      <div className={styles.reviewTop}>
                        <StarRating value={f.overall_rating} size="sm" />
                        <span className={styles.reviewRating}>{f.overall_rating}/5</span>
                        <span className={styles.reviewDate}>{formatDate(f.created_at)}</span>
                      </div>
                      {f.ratings && (
                        <div className={styles.reviewBreakdown}>
                          {Object.entries(f.ratings).map(([k, v]) => (
                            <span key={k} className={styles.reviewBreakdownItem}>
                              {k.replace(/_/g, ' ')}: <strong>{v}/5</strong>
                            </span>
                          ))}
                        </div>
                      )}
                      {f.comment && (
                        <p className={styles.reviewComment}>"{f.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}