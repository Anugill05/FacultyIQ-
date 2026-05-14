import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, Avatar, StarRating, ScoreBar, Badge } from '../../components/common/Common';
import { studentAPI } from '../../services/api';
import { getScoreColor, formatDate, truncate } from '../../utils/helpers';
import styles from './StudentTeacherProfile.module.css';

export default function StudentTeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
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
        {/* Back */}
        <button className={styles.backBtn} onClick={() => navigate('/student/teachers')}>
          ← Back to Directory
        </button>

        <div className={styles.profileGrid}>
          {/* Left Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileTop}>
              <Avatar name={teacher?.name} src={teacher?.avatar} size="xl" />
              <div className={styles.profileInfo}>
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

            {/* Rating breakdown bars */}
            <div className={styles.ratingBreakdown}>
              {breakdownEntries.map(([star, count]) => (
                <div key={star} className={styles.breakdownRow}>
                  <span className={styles.breakdownStar}>{star}★</span>
                  <div className={styles.breakdownBar}>
                    <div style={{ width: maxReviews > 0 ? `${(count / maxReviews) * 100}%` : '0%', background: 'var(--gold-400)', height: '100%', borderRadius: '999px', transition: 'width 0.8s ease' }} />
                  </div>
                  <span className={styles.breakdownCount}>{count}</span>
                </div>
              ))}
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoRow}><span>🎓</span><span>{teacher?.qualification}</span></div>
              <div className={styles.infoRow}><span>🔬</span><span>{teacher?.specialization || 'Not specified'}</span></div>
              <div className={styles.infoRow}><span>📅</span><span>{teacher?.experience_years || 0} years experience</span></div>
              <div className={styles.infoRow}><span>✉️</span><span>{teacher?.email}</span></div>
            </div>

            {my_feedback ? (
              <div className={styles.alreadyRated}>
                <span>✅</span>
                <div>
                  <p className={styles.alreadyRatedTitle}>You've submitted feedback</p>
                  <StarRating value={my_feedback.overall_rating} size="sm" />
                </div>
              </div>
            ) : (
              <Link to={`/student/feedback?teacher_id=${id}&teacher_name=${encodeURIComponent(teacher?.name)}`}
                className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                ⭐ Rate this Teacher
              </Link>
            )}
          </div>

          {/* Right: Bio + Reviews */}
          <div className={styles.rightPanel}>
            {teacher?.bio && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>About</h3>
                <p style={{ fontSize: 14, color: 'var(--neutral-600)', lineHeight: 1.7, marginTop: 10 }}>{teacher.bio}</p>
              </div>
            )}

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Student Reviews ({total_reviews})</h3>
              {feedbacks?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--neutral-400)' }}>
                  <p style={{ fontSize: 32 }}>💬</p>
                  <p style={{ marginTop: 8 }}>No public reviews yet.</p>
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
