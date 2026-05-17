import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { LoadingSpinner, EmptyState, Badge } from '../../components/common/Common';
import { adminAPI } from '../../services/api';
import { formatDateTime, getAnnouncementStyle } from '../../utils/helpers';
import { useModal } from '../../hooks';
import toast from 'react-hot-toast';
import styles from './AdminAnnouncements.module.css';

const initialForm = { title: '', content: '', type: 'info', target_role: 'all', expires_at: '' };

const darkLabel = {
  fontSize: 11,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.6)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 4,
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
};

const darkInput = {
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: 9,
  color: '#e2e8f0',
  fontFamily: "'DM Sans', sans-serif",
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const createModal = useModal();
  const deleteModal = useModal();

  const fetchAnnouncements = useCallback(() => {
    setLoading(true);
    adminAPI.getAnnouncements()
      .then(res => setAnnouncements(res.data.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!form.title.trim()) e2.title = 'Required';
    if (!form.content.trim()) e2.content = 'Required';
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSubmitting(true);
    try {
      await adminAPI.createAnnouncement(form);
      toast.success('Announcement posted!');
      createModal.close();
      setForm(initialForm);
      fetchAnnouncements();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteAnnouncement(deleteModal.data.id);
      toast.success('Announcement deleted');
      deleteModal.close();
      fetchAnnouncements();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <DashboardLayout title="Announcements" subtitle="Post updates and notices to faculty and students">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.info}>
            <span className={styles.totalBadge}>{announcements.length} Active</span>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(initialForm); setErrors({}); createModal.open(); }}>
            + Post Announcement
          </button>
        </div>

        {loading ? <LoadingSpinner text="Loading announcements..." /> : announcements.length === 0 ? (
          <EmptyState icon="📢" title="No announcements" description="Post your first announcement to notify faculty and students." />
        ) : (
          <div className={styles.announcementsList}>
            {announcements.map((a, i) => {
              const style = getAnnouncementStyle(a.type);
              return (
                <div key={a.id} className={styles.announcementCard} style={{ animationDelay: `${i * 0.05}s`, borderLeftColor: style.border }}>
                  <div className={styles.announcementLeft}>
                    <span className={styles.announcementIcon}>{style.icon}</span>
                    <div className={styles.announcementContent}>
                      <div className={styles.announcementMeta}>
                        <span className={styles.announcementType}
                          style={{ background: style.bg, color: style.color }}>{a.type}</span>
                        <span className={styles.announcementTarget}>→ {a.target_role}</span>
                        {a.expires_at && <span className={styles.announcementExpiry}>Expires: {formatDateTime(a.expires_at)}</span>}
                      </div>
                      <h3 className={styles.announcementTitle}>{a.title}</h3>
                      <p className={styles.announcementBody}>{a.content}</p>
                      <span className={styles.announcementDate}>{formatDateTime(a.created_at)} · by {a.author?.name || 'Admin'}</span>
                    </div>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => deleteModal.open(a)}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Post New Announcement" size="md">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={darkLabel}>Title *</label>
            <input className={`form-input ${errors.title ? 'error' : ''}`} style={darkInput} value={form.title}
              onChange={e => set('title', e.target.value)} placeholder="Announcement title..." />
            {errors.title && <span style={{ fontSize: 12, color: '#f87171', marginTop: 4, display: 'block' }}>{errors.title}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={darkLabel}>Type</label>
              <select className="form-input" style={darkInput} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label style={darkLabel}>Target Audience</label>
              <select className="form-input" style={darkInput} value={form.target_role} onChange={e => set('target_role', e.target.value)}>
                <option value="all">Everyone</option>
                <option value="teacher">Faculty Only</option>
                <option value="student">Students Only</option>
              </select>
            </div>
          </div>
          <div>
            <label style={darkLabel}>Content *</label>
            <textarea className={`form-input form-textarea ${errors.content ? 'error' : ''}`} style={darkInput}
              value={form.content} onChange={e => set('content', e.target.value)}
              placeholder="Write your announcement..." rows={4} />
            {errors.content && <span style={{ fontSize: 12, color: '#f87171', marginTop: 4, display: 'block' }}>{errors.content}</span>}
          </div>
          <div>
            <label style={darkLabel}>Expiry Date (Optional)</label>
            <input type="datetime-local" className="form-input" style={darkInput} value={form.expires_at}
              onChange={e => set('expires_at', e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14 }}>
            <button type="button" className="btn btn-ghost" onClick={createModal.close}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Delete Announcement" size="sm">
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
            Delete <strong style={{ color: '#e2e8f0' }}>"{deleteModal.data?.title}"</strong>?
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={deleteModal.close}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}