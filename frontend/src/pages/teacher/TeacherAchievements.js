import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { LoadingSpinner, EmptyState, Badge } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { formatDate, achievementCategories } from '../../utils/helpers';
import { useModal } from '../../hooks';
import toast from 'react-hot-toast';
import styles from './TeacherAchievements.module.css';

const catIcons = { publication:'📄', award:'🏆', certification:'📜', conference:'🎙️', patent:'💡', project:'🔬' };
const catColors = {
  publication: { bg: '#dbeafe', color: '#1e40af' },
  award: { bg: '#fef3c7', color: '#92400e' },
  certification: { bg: '#dcfce7', color: '#166534' },
  conference: { bg: '#ede9fe', color: '#5b21b6' },
  patent: { bg: '#ffedd5', color: '#9a3412' },
  project: { bg: '#f0fdf4', color: '#14532d' },
};

const initialForm = { title: '', description: '', category: 'publication', date_achieved: '', issuing_organization: '', certificate: null };

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

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

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
      Object.entries(form).forEach(([k, v]) => { if (k !== 'certificate' && v) fd.append(k, v); });
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

  const totalPoints = achievements.filter(a => a.verified).reduce((sum, a) => sum + (a.points || 0), 0);

  return (
    <DashboardLayout title="My Achievements" subtitle="Upload and manage your professional achievements">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.statsRow}>
            <div className={styles.statChip}>
              <span>🏅</span>
              <strong>{achievements.length}</strong> Total
            </div>
            <div className={styles.statChip}>
              <span>✅</span>
              <strong>{achievements.filter(a => a.verified).length}</strong> Verified
            </div>
            <div className={styles.statChip}>
              <span>⏳</span>
              <strong>{achievements.filter(a => !a.verified).length}</strong> Pending
            </div>
            <div className={styles.statChip}>
              <span>⭐</span>
              <strong>{totalPoints}</strong> Points
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(initialForm); setErrors({}); uploadModal.open(); }}>
            + Upload Achievement
          </button>
        </div>

        {loading ? <LoadingSpinner text="Loading achievements..." /> : achievements.length === 0 ? (
          <EmptyState icon="🏅" title="No achievements yet"
            description="Upload your publications, awards, certifications and more."
            action={<button className="btn btn-primary" onClick={uploadModal.open}>Upload First Achievement</button>} />
        ) : (
          <div className={styles.achievementsGrid}>
            {achievements.map((a, i) => {
              const cat = catColors[a.category] || { bg: '#f1f5f9', color: '#475569' };
              return (
                <div key={a.id} className={styles.achievementCard} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className={styles.cardTop}>
                    <div className={styles.catIcon} style={{ background: cat.bg, color: cat.color }}>
                      {catIcons[a.category] || '🎖'}
                    </div>
                    <Badge variant={a.verified ? 'success' : 'warning'}>
                      {a.verified ? '✓ Verified' : '⏳ Pending'}
                    </Badge>
                  </div>
                  <h3 className={styles.achievementTitle}>{a.title}</h3>
                  <p className={styles.achievementDesc}>{a.description?.slice(0, 100)}{a.description?.length > 100 ? '...' : ''}</p>
                  <div className={styles.achievementMeta}>
                    <span>🏛️ {a.issuing_organization}</span>
                    <span>📅 {formatDate(a.date_achieved)}</span>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.catLabel} style={{ background: cat.bg, color: cat.color }}>
                      {achievementCategories[a.category]}
                    </span>
                    <span className={styles.pointsLabel}>+{a.points} pts</span>
                    {a.certificate_url && (
                      <a href={`http://localhost:8000/storage/${a.certificate_url}`} target="_blank" rel="noreferrer" className={styles.certLink}>
                        📎 View
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={uploadModal.isOpen} onClose={uploadModal.close} title="Upload Achievement" size="md">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Achievement Title *</label>
            <input className={`form-input ${errors.title ? 'error' : ''}`} value={form.title}
              onChange={e => set('title', e.target.value)} placeholder="Best Paper Award - IEEE 2024" />
            {errors.title && <span style={{ fontSize: 12, color: 'var(--error-600)' }}>{errors.title}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {Object.entries(achievementCategories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Date Achieved *</label>
              <input type="date" className={`form-input ${errors.date_achieved ? 'error' : ''}`}
                value={form.date_achieved} onChange={e => set('date_achieved', e.target.value)} />
              {errors.date_achieved && <span style={{ fontSize: 12, color: 'var(--error-600)' }}>{errors.date_achieved}</span>}
            </div>
          </div>
          <div>
            <label className="form-label">Issuing Organization *</label>
            <input className={`form-input ${errors.issuing_organization ? 'error' : ''}`}
              value={form.issuing_organization} onChange={e => set('issuing_organization', e.target.value)}
              placeholder="IEEE, Springer, AICTE..." />
            {errors.issuing_organization && <span style={{ fontSize: 12, color: 'var(--error-600)' }}>{errors.issuing_organization}</span>}
          </div>
          <div>
            <label className="form-label">Description *</label>
            <textarea className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
              value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="Brief description of this achievement..." />
            {errors.description && <span style={{ fontSize: 12, color: 'var(--error-600)' }}>{errors.description}</span>}
          </div>
          <div>
            <label className="form-label">Certificate / Proof (PDF/Image, optional)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="form-input"
              onChange={e => set('certificate', e.target.files[0])}
              style={{ padding: '8px 12px', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--neutral-100)', paddingTop: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={uploadModal.close}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : '🏅 Submit for Verification'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
