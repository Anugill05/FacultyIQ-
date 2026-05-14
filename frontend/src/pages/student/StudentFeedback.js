import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar } from '../../components/common/Common';
import { studentAPI } from '../../services/api';
import { departments, getAcademicYears } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './StudentFeedback.module.css';

const ratingFields = [
  { key: 'teaching_quality', label: 'Teaching Quality', icon: '📖', desc: 'Clarity and effectiveness of teaching' },
  { key: 'communication', label: 'Communication', icon: '🗣️', desc: 'Clear communication with students' },
  { key: 'subject_knowledge', label: 'Subject Knowledge', icon: '🧠', desc: 'Depth of knowledge in the subject' },
  { key: 'student_interaction', label: 'Student Interaction', icon: '🤝', desc: 'Engagement and approachability' },
  { key: 'punctuality', label: 'Punctuality', icon: '⏰', desc: 'On-time attendance and deadlines' },
];

const starLabels = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

export default function StudentFeedback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preTeacherId = searchParams.get('teacher_id');
  const preTeacherName = searchParams.get('teacher_name');

  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    teacher_id: preTeacherId || '',
    subject: '',
    semester: '1',
    academic_year: '2024-2025',
    ratings: { teaching_quality: 0, communication: 0, subject_knowledge: 0, student_interaction: 0, punctuality: 0 },
    comment: '',
    is_anonymous: false,
  });
  const [errors, setErrors] = useState({});
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
    const hasZero = Object.values(form.ratings).some(v => v === 0);
    if (hasZero) e.ratings = 'Please rate all criteria';
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
      toast.success('Feedback submitted! Thank you 🎉');
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

  if (submitted) {
    return (
      <DashboardLayout title="Feedback">
        <div className={styles.successWrap}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>Thank You!</h2>
            <p className={styles.successDesc}>Your feedback has been submitted and will help the faculty improve their teaching.</p>
            <div className={styles.successActions}>
              <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm(p => ({ ...p, teacher_id: '', subject: '', ratings: { teaching_quality: 0, communication: 0, subject_knowledge: 0, student_interaction: 0, punctuality: 0 }, comment: '' })); }}>
                Submit Another
              </button>
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
                  <select className={`form-input ${errors.teacher_id ? 'error' : ''}`}
                    value={form.teacher_id}
                    onChange={e => { setForm(p => ({ ...p, teacher_id: e.target.value })); setErrors(p => ({ ...p, teacher_id: '' })); }}>
                    <option value="">-- Select a faculty member --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} — {t.department}</option>
                    ))}
                  </select>
                )}
                {errors.teacher_id && <span className={styles.errorMsg}>{errors.teacher_id}</span>}
              </div>

              <div className={styles.row2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Subject *</label>
                  <input className={`form-input ${errors.subject ? 'error' : ''}`}
                    value={form.subject} onChange={e => { setForm(p => ({ ...p, subject: e.target.value })); setErrors(p => ({ ...p, subject: '' })); }}
                    placeholder="e.g., Data Structures" />
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
                  {ratingFields.map(field => (
                    <div key={field.key} className={styles.ratingItem}>
                      <div className={styles.ratingLeft}>
                        <span className={styles.ratingIcon}>{field.icon}</span>
                        <div>
                          <p className={styles.ratingLabel}>{field.label}</p>
                          <p className={styles.ratingDesc}>{field.desc}</p>
                        </div>
                      </div>
                      <div className={styles.starsWrap}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            className={`${styles.star} ${star <= (hovered[field.key] || form.ratings[field.key]) ? styles.starActive : ''}`}
                            onMouseEnter={() => setHovered(p => ({ ...p, [field.key]: star }))}
                            onMouseLeave={() => setHovered(p => ({ ...p, [field.key]: 0 }))}
                            onClick={() => setRating(field.key, star)}
                          >★</button>
                        ))}
                        <span className={styles.starLabel}>
                          {starLabels[hovered[field.key] || form.ratings[field.key]] || ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Additional Comments (Optional)</label>
                <textarea className="form-input form-textarea"
                  value={form.comment}
                  onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Share your thoughts, suggestions, or experiences..."
                  rows={4} />
                <span className={styles.charCount}>{form.comment.length}/1000</span>
              </div>

              {/* Anonymous toggle */}
              <div className={styles.anonymousRow}>
                <label className={styles.anonymousLabel}>
                  <input type="checkbox" checked={form.is_anonymous}
                    onChange={e => setForm(p => ({ ...p, is_anonymous: e.target.checked }))} />
                  Submit anonymously
                </label>
                <span className={styles.anonymousNote}>Your identity will not be shared with the teacher</span>
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                {submitting ? '⟳ Submitting...' : '⭐ Submit Feedback'}
              </button>
            </form>
          </div>

          {/* Preview sidebar */}
          <div className={styles.previewCard}>
            <h3 className={styles.previewTitle}>Your Rating Preview</h3>
            <div className={styles.previewAvg}>
              <span className={styles.previewAvgVal}>{avgRating}</span>
              <span className={styles.previewAvgLabel}>Overall</span>
            </div>
            <div className={styles.previewStars}>
              {'★'.repeat(Math.round(parseFloat(avgRating)))}{'☆'.repeat(5 - Math.round(parseFloat(avgRating)))}
            </div>
            <div className={styles.previewBreakdown}>
              {ratingFields.map(f => (
                <div key={f.key} className={styles.previewItem}>
                  <span>{f.icon} {f.label}</span>
                  <div className={styles.previewBar}>
                    <div style={{ width: `${(form.ratings[f.key] / 5) * 100}%`, background: form.ratings[f.key] >= 4 ? 'var(--success-500)' : form.ratings[f.key] >= 3 ? 'var(--gold-400)' : form.ratings[f.key] > 0 ? 'var(--error-500)' : 'var(--neutral-300)', transition: 'width 0.4s ease, background 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral-600)', minWidth: 20 }}>
                    {form.ratings[f.key] > 0 ? form.ratings[f.key] : '–'}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.previewNote}>
              <span>🔒</span>
              <p>Feedback helps improve teaching quality at LPU. Your honest review matters.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
