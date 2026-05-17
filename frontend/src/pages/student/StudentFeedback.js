import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar } from '../../components/common/Common';
import { studentAPI } from '../../services/api';
import { departments, getAcademicYears } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './StudentFeedback.module.css';

/* ─── SVG Icons ──────────────────────────────────────────── */

const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const IconMessage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconBrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.8 3 3 0 0 1 .09-5.85A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.8 3 3 0 0 0-.09-5.85A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/* ─── Rating Fields ──────────────────────────────────────── */

const ratingFields = [
  { key: 'teaching_quality',   label: 'Teaching Quality',   Icon: IconBook,    desc: 'Clarity and effectiveness of teaching' },
  { key: 'communication',      label: 'Communication',      Icon: IconMessage, desc: 'Clear communication with students' },
  { key: 'subject_knowledge',  label: 'Subject Knowledge',  Icon: IconBrain,   desc: 'Depth of knowledge in the subject' },
  { key: 'student_interaction',label: 'Student Interaction', Icon: IconUsers,   desc: 'Engagement and approachability' },
  { key: 'punctuality',        label: 'Punctuality',        Icon: IconClock,   desc: 'On-time attendance and deadlines' },
];

const starLabels = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

/* ─── Component ──────────────────────────────────────────── */

export default function StudentFeedback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preTeacherId   = searchParams.get('teacher_id');

  const [teachers, setTeachers]           = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  const [form, setForm] = useState({
    teacher_id:    preTeacherId || '',
    subject:       '',
    semester:      '1',
    academic_year: '2024-2025',
    ratings: {
      teaching_quality: 0, communication: 0,
      subject_knowledge: 0, student_interaction: 0, punctuality: 0,
    },
    comment:      '',
    is_anonymous: false,
  });
  const [errors, setErrors]   = useState({});
  const [hovered, setHovered] = useState({});

  useEffect(() => {
    studentAPI.getTeachers({ per_page: 100 })
      .then(res => setTeachers(res.data.data.data || []))
      .finally(() => setLoadingTeachers(false));
  }, []);

  const setRating = (field, val) => {
    setForm(p => ({ ...p, ratings: { ...p.ratings, [field]: val } }));
    setErrors(p => ({ ...p, ratings: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.teacher_id) e.teacher_id = 'Select a teacher';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (Object.values(form.ratings).some(v => v === 0)) e.ratings = 'Please rate all criteria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await studentAPI.submitFeedback(form);
      setSubmitted(true);
      toast.success('Feedback submitted! Thank you.');
    } catch (err) {
      const data = err?.response?.data;
      if (data?.message) toast.error(data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = Object.values(form.ratings).filter(v => v > 0).length > 0
    ? (Object.values(form.ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1)
    : '0.0';

  const resetForm = () => {
    setSubmitted(false);
    setForm(p => ({
      ...p,
      teacher_id: '', subject: '',
      ratings: { teaching_quality: 0, communication: 0, subject_knowledge: 0, student_interaction: 0, punctuality: 0 },
      comment: '',
    }));
  };

  if (submitted) {
    return (
      <DashboardLayout title="Feedback">
        <div className={styles.successWrap}>
          <div className={styles.successCard}>
            <div className={styles.successIconWrap}><IconCheck /></div>
            <h2 className={styles.successTitle}>Thank You!</h2>
            <p className={styles.successDesc}>Your feedback has been submitted and will help the faculty improve their teaching.</p>
            <div className={styles.successActions}>
              <button className="btn btn-primary" onClick={resetForm}>Submit Another</button>
              <Link to="/student/teachers" className="btn btn-secondary">Browse Faculty</Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Give Feedback" subtitle="Share your experience with faculty members">
      <div className={styles.page}>
        <div className={styles.formGrid}>

          {/* Form */}
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Faculty Feedback Form</h3>
            <p className={styles.formSubtitle}>Your feedback is confidential and helps improve teaching quality.</p>

            <form onSubmit={handleSubmit} className={styles.form}>

              {/* Teacher Select */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Select Teacher *</label>
                {loadingTeachers ? <LoadingSpinner text="" /> : (
                  <select
                    className={`form-input ${errors.teacher_id ? 'error' : ''}`}
                    value={form.teacher_id}
                    onChange={e => { setForm(p => ({ ...p, teacher_id: e.target.value })); setErrors(p => ({ ...p, teacher_id: '' })); }}
                  >
                    <option value="">— Select a faculty member —</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} — {t.department}</option>
                    ))}
                  </select>
                )}
                {errors.teacher_id && <span className={styles.errorMsg}>{errors.teacher_id}</span>}
              </div>

              {/* Subject + Semester */}
              <div className={styles.row2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Subject *</label>
                  <input
                    className={`form-input ${errors.subject ? 'error' : ''}`}
                    value={form.subject}
                    onChange={e => { setForm(p => ({ ...p, subject: e.target.value })); setErrors(p => ({ ...p, subject: '' })); }}
                    placeholder="e.g., Data Structures"
                  />
                  {errors.subject && <span className={styles.errorMsg}>{errors.subject}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Semester</label>
                  <select className="form-input" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>

              {/* Academic Year */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Academic Year</label>
                <select className="form-input" value={form.academic_year} onChange={e => setForm(p => ({ ...p, academic_year: e.target.value }))}>
                  {getAcademicYears().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Star Ratings */}
              <div className={styles.ratingsSection}>
                <label className={styles.label}>Rate Each Criterion *</label>
                {errors.ratings && <span className={styles.errorMsg}>{errors.ratings}</span>}
                <div className={styles.ratingsList}>
                  {ratingFields.map(({ key, label, Icon, desc }) => (
                    <div key={key} className={styles.ratingItem}>
                      <div className={styles.ratingLeft}>
                        <div className={styles.ratingIconWrap}><Icon /></div>
                        <div>
                          <p className={styles.ratingLabel}>{label}</p>
                          <p className={styles.ratingDesc}>{desc}</p>
                        </div>
                      </div>
                      <div className={styles.starsWrap}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            className={`${styles.star} ${star <= (hovered[key] || form.ratings[key]) ? styles.starActive : ''}`}
                            onMouseEnter={() => setHovered(p => ({ ...p, [key]: star }))}
                            onMouseLeave={() => setHovered(p => ({ ...p, [key]: 0 }))}
                            onClick={() => setRating(key, star)}
                          >★</button>
                        ))}
                        <span className={styles.starLabel}>
                          {starLabels[hovered[key] || form.ratings[key]] || ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Additional Comments (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.comment}
                  onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Share your thoughts, suggestions, or experiences..."
                  rows={4}
                />
                <span className={styles.charCount}>{form.comment.length}/1000</span>
              </div>

              {/* Anonymous */}
              <div className={styles.anonymousRow}>
                <label className={styles.anonymousLabel}>
                  <input
                    type="checkbox"
                    checked={form.is_anonymous}
                    onChange={e => setForm(p => ({ ...p, is_anonymous: e.target.checked }))}
                  />
                  Submit anonymously
                </label>
                <span className={styles.anonymousNote}>Your identity will not be shared with the teacher</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback →'}
              </button>
            </form>
          </div>

          {/* Preview Sidebar */}
          <div className={styles.previewCard}>
            <h3 className={styles.previewTitle}>Your Rating Preview</h3>
            <div className={styles.previewAvg}>
              <span className={styles.previewAvgVal}>{avgRating}</span>
              <span className={styles.previewAvgLabel}>Overall</span>
            </div>
            <div className={styles.previewStars}>
              {'★'.repeat(Math.round(parseFloat(avgRating)))}
              {'☆'.repeat(5 - Math.round(parseFloat(avgRating)))}
            </div>
            <div className={styles.previewBreakdown}>
              {ratingFields.map(({ key, label }) => (
                <div key={key} className={styles.previewItem}>
                  <span>{label}</span>
                  <div className={styles.previewBar}>
                    <div style={{
                      width: `${(form.ratings[key] / 5) * 100}%`,
                      background: form.ratings[key] >= 4 ? '#34d399' : form.ratings[key] >= 3 ? '#a78bfa' : form.ratings[key] > 0 ? '#f87171' : 'transparent',
                      transition: 'width 0.4s ease, background 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', minWidth: 20 }}>
                    {form.ratings[key] > 0 ? form.ratings[key] : '—'}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.previewNote}>
              <span className={styles.previewNoteIcon}><IconLock /></span>
              <p>Feedback helps improve teaching quality at LPU. Your honest review matters.</p>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}