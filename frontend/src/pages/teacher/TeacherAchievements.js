import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { LoadingSpinner, EmptyState, Badge } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { formatDate, achievementCategories } from '../../utils/helpers';
import { useModal } from '../../hooks';
import toast from 'react-hot-toast';
import styles from './TeacherAchievements.module.css';

const catIcons = {
  publication: '📄',
  award: '🏆',
  certification: '📜',
  conference: '🎙️',
  patent: '💡',
  project: '🔬',
};

const catColors = {
  publication: { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  award:       { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  certification: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80' },
  conference:  { bg: 'rgba(167,139,250,0.12)', color: '#c4b5fd' },
  patent:      { bg: 'rgba(251,113,133,0.12)', color: '#fca5a5' },
  project:     { bg: 'rgba(52,211,153,0.12)',  color: '#6ee7b7' },
};

const initialForm = {
  title: '',
  description: '',
  category: 'publication',
  date_achieved: '',
  issuing_organization: '',
  certificate: null,
};

const label = {
  color: 'rgba(255,255,255,0.72)',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: '0.01em',
};

const darkInput = {
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#e2e8f0',
  borderRadius: 10,
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
};

const darkInputFocus = {
  borderColor: '#6366f1',
};

export default function TeacherAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const uploadModal = useModal();

  const fetchAchievements = () => {
    setLoading(true);
    teacherAPI.getAchievements()
      .then(res => setAchievements(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAchievements(); }, []);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!form.title.trim()) e2.title = 'Required';
    if (!form.description.trim()) e2.description = 'Required';
    if (!form.date_achieved) e2.date_achieved = 'Required';
    if (!form.issuing_organization.trim()) e2.issuing_organization = 'Required';
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'certificate' && v) fd.append(k, v);
      });
      if (form.certificate) fd.append('certificate', form.certificate);
      await teacherAPI.uploadAchievement(fd);
      toast.success('Achievement submitted for verification!');
      uploadModal.close();
      setForm(initialForm);
      fetchAchievements();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPoints = achievements
    .filter(a => a.verified)
    .reduce((sum, a) => sum + (a.points || 0), 0);

  return (
    <DashboardLayout title="My Achievements" subtitle="Upload and manage your professional achievements">
      <div className={styles.page}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.statsRow}>
            <div className={styles.statChip}>
              <strong>{achievements.length}</strong>
              <span>Total</span>
            </div>
            <div className={styles.statChip}>
              <strong>{achievements.filter(a => a.verified).length}</strong>
              <span>Verified</span>
            </div>
            <div className={styles.statChip}>
              <strong>{achievements.filter(a => !a.verified).length}</strong>
              <span>Pending</span>
            </div>
            <div className={styles.statChip}>
              <strong>{totalPoints}</strong>
              <span>Points</span>
            </div>
          </div>
          <button
            style={{
              padding: '10px 22px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
            onClick={() => { setForm(initialForm); setErrors({}); uploadModal.open(); }}
          >
            Upload Achievement
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading achievements..." />
        ) : achievements.length === 0 ? (
          <EmptyState
            icon="🏅"
            title="No achievements yet"
            description="Upload your publications, awards, certifications and more."
            action={
              <button
                style={{
                  padding: '10px 22px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onClick={uploadModal.open}
              >
                Upload First Achievement
              </button>
            }
          />
        ) : (
          <div className={styles.achievementsGrid}>
            {achievements.map((a, i) => {
              const cat = catColors[a.category] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' };
              return (
                <div
                  key={a.id}
                  className={styles.achievementCard}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.catIcon} style={{ background: cat.bg, color: cat.color }}>
                      {catIcons[a.category] || '🎖'}
                    </div>
                    <Badge variant={a.verified ? 'success' : 'warning'}>
                      {a.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <h3 className={styles.achievementTitle}>{a.title}</h3>
                  <p className={styles.achievementDesc}>
                    {a.description?.slice(0, 100)}{a.description?.length > 100 ? '...' : ''}
                  </p>
                  <div className={styles.achievementMeta}>
                    <span>{a.issuing_organization}</span>
                    <span>{formatDate(a.date_achieved)}</span>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.catLabel} style={{ background: cat.bg, color: cat.color }}>
                      {achievementCategories[a.category]}
                    </span>
                    <span className={styles.pointsLabel}>+{a.points} pts</span>
                    {a.certificate_url && (
                      <a
                        href={`${process.env.REACT_APP_BASE_URL}/storage/${a.certificate_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.certLink}
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.close}
        title="Upload Achievement"
        size="md"
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          {/* Title */}
          <div>
            <label style={label}>Achievement Title *</label>
            <input
              style={{
                ...darkInput,
                ...(errors.title ? { borderColor: '#f87171' } : {}),
              }}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Best Paper Award — IEEE 2024"
            />
            {errors.title && (
              <span style={{ fontSize: 12, color: '#f87171', marginTop: 4, display: 'block' }}>
                {errors.title}
              </span>
            )}
          </div>

          {/* Category + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={label}>Category</label>
              <select
                style={darkInput}
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                {Object.entries(achievementCategories).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: '#1a1f2e', color: '#e2e8f0' }}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={label}>Date Achieved *</label>
              <input
                type="date"
                style={{
                  ...darkInput,
                  colorScheme: 'dark',
                  ...(errors.date_achieved ? { borderColor: '#f87171' } : {}),
                }}
                value={form.date_achieved}
                onChange={e => set('date_achieved', e.target.value)}
              />
              {errors.date_achieved && (
                <span style={{ fontSize: 12, color: '#f87171', marginTop: 4, display: 'block' }}>
                  {errors.date_achieved}
                </span>
              )}
            </div>
          </div>

          {/* Issuing Organization */}
          <div>
            <label style={label}>Issuing Organization *</label>
            <input
              style={{
                ...darkInput,
                ...(errors.issuing_organization ? { borderColor: '#f87171' } : {}),
              }}
              value={form.issuing_organization}
              onChange={e => set('issuing_organization', e.target.value)}
              placeholder="IEEE, Springer, AICTE..."
            />
            {errors.issuing_organization && (
              <span style={{ fontSize: 12, color: '#f87171', marginTop: 4, display: 'block' }}>
                {errors.issuing_organization}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={label}>Description *</label>
            <textarea
              style={{
                ...darkInput,
                resize: 'vertical',
                minHeight: 80,
                ...(errors.description ? { borderColor: '#f87171' } : {}),
              }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Brief description of this achievement..."
            />
            {errors.description && (
              <span style={{ fontSize: 12, color: '#f87171', marginTop: 4, display: 'block' }}>
                {errors.description}
              </span>
            )}
          </div>

          {/* Certificate Upload */}
          <div>
            <label style={label}>Certificate / Proof (PDF or Image, optional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{
                ...darkInput,
                padding: '9px 14px',
                cursor: 'pointer',
              }}
              onChange={e => set('certificate', e.target.files[0])}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 16,
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={uploadModal.close}
              style={{
                padding: '9px 20px',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 22px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                opacity: submitting ? 0.65 : 1,
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}