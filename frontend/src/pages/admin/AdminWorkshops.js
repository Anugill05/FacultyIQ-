import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { LoadingSpinner, EmptyState, Badge } from '../../components/common/Common';
import { adminAPI } from '../../services/api';
import { formatDate, workshopCategories } from '../../utils/helpers';
import { useModal } from '../../hooks';
import toast from 'react-hot-toast';
import styles from './AdminWorkshops.module.css';

const initialForm = {
  title: '', description: '', category: 'technical', facilitator: '',
  start_date: '', end_date: '', start_time: '09:00', end_time: '17:00',
  venue: '', mode: 'offline', max_participants: 30,
  registration_deadline: '', points_awarded: 15, certificate_provided: true,
};

const modeColors = { online: 'primary', offline: 'success', hybrid: 'warning' };
const statusColors = { upcoming: 'primary', ongoing: 'warning', completed: 'success', cancelled: 'error' };

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const createModal = useModal();
  const deleteModal = useModal();

  const fetchWorkshops = useCallback(() => {
    setLoading(true);
    adminAPI.getWorkshops({ status: statusFilter })
      .then(res => setWorkshops(res.data.data.data || []))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchWorkshops(); }, [fetchWorkshops]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.facilitator.trim()) e.facilitator = 'Required';
    if (!form.start_date) e.start_date = 'Required';
    if (!form.venue.trim()) e.venue = 'Required';
    if (!form.registration_deadline) e.registration_deadline = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editId) {
        await adminAPI.updateWorkshop(editId, form);
        toast.success('Workshop updated!');
      } else {
        await adminAPI.createWorkshop(form);
        toast.success('Workshop created!');
      }
      createModal.close();
      setForm(initialForm);
      setEditId(null);
      fetchWorkshops();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (w) => {
    setEditId(w.id);
    setForm({ ...initialForm, ...w, start_date: w.start_date?.split('T')[0] || '', end_date: w.end_date?.split('T')[0] || '', registration_deadline: w.registration_deadline?.split('T')[0] || '' });
    setErrors({});
    createModal.open();
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteWorkshop(deleteModal.data.id);
      toast.success('Workshop deleted');
      deleteModal.close();
      fetchWorkshops();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <DashboardLayout title="Workshops & Training" subtitle="Manage faculty development programs">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {['', 'upcoming', 'ongoing', 'completed', 'cancelled'].map(s => (
              <button key={s} className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter(s)}>
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(initialForm); setErrors({}); createModal.open(); }}>
            + New Workshop
          </button>
        </div>

        {loading ? <LoadingSpinner text="Loading workshops..." /> : workshops.length === 0 ? (
          <EmptyState icon="🎯" title="No workshops found" description="Create your first workshop to get started." />
        ) : (
          <div className={styles.workshopsGrid}>
            {workshops.map((w, i) => (
              <div key={w.id} className={styles.workshopCard} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={styles.workshopCardTop}>
                  <div className={styles.workshopMeta}>
                    <Badge variant={statusColors[w.status] || 'neutral'}>{w.status}</Badge>
                    <Badge variant={modeColors[w.mode] || 'neutral'}>{w.mode}</Badge>
                  </div>
                  <div className={styles.workshopCategory}>
                    {workshopCategories[w.category] || w.category}
                  </div>
                </div>
                <h3 className={styles.workshopTitle}>{w.title}</h3>
                <p className={styles.workshopDesc}>{w.description?.slice(0, 100)}...</p>
                <div className={styles.workshopDetails}>
                  <span>📅 {formatDate(w.start_date)}</span>
                  <span>📍 {w.venue}</span>
                  <span>👤 {w.facilitator}</span>
                  <span>👥 {w.current_participants}/{w.max_participants}</span>
                </div>
                <div className={styles.workshopFooter}>
                  <div className={styles.workshopPoints}>
                    <span>🏆 {w.points_awarded} pts</span>
                    {w.certificate_provided && <span>📜 Certificate</span>}
                  </div>
                  <div className={styles.workshopActions}>
                    <button className={styles.editBtn} onClick={() => handleEdit(w)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteModal.open(w)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title={editId ? 'Edit Workshop' : 'Create New Workshop'} size="lg">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Workshop Title *</label>
              <input className={`form-input ${errors.title ? 'error' : ''}`} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Advanced Pedagogy Workshop" />
              {errors.title && <span style={{ fontSize: 12, color: 'var(--error-600)' }}>{errors.title}</span>}
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {Object.entries(workshopCategories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Mode</label>
              <select className="form-input" value={form.mode} onChange={e => set('mode', e.target.value)}>
                {['online', 'offline', 'hybrid'].map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Facilitator *</label>
              <input className={`form-input ${errors.facilitator ? 'error' : ''}`} value={form.facilitator} onChange={e => set('facilitator', e.target.value)} placeholder="Dr. Name (Institution)" />
              {errors.facilitator && <span style={{ fontSize: 12, color: 'var(--error-600)' }}>{errors.facilitator}</span>}
            </div>
            <div>
              <label className="form-label">Venue *</label>
              <input className={`form-input ${errors.venue ? 'error' : ''}`} value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Seminar Hall A" />
              {errors.venue && <span style={{ fontSize: 12, color: 'var(--error-600)' }}>{errors.venue}</span>}
            </div>
            <div>
              <label className="form-label">Start Date *</label>
              <input type="date" className={`form-input ${errors.start_date ? 'error' : ''}`} value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
            </div>
            <div>
              <label className="form-label">End Time</label>
              <input type="time" className="form-input" value={form.end_time} onChange={e => set('end_time', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Max Participants</label>
              <input type="number" min="1" className="form-input" value={form.max_participants} onChange={e => set('max_participants', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Registration Deadline *</label>
              <input type="date" className={`form-input ${errors.registration_deadline ? 'error' : ''}`} value={form.registration_deadline} onChange={e => set('registration_deadline', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Points Awarded</label>
              <input type="number" min="0" className="form-input" value={form.points_awarded} onChange={e => set('points_awarded', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Certificate Provided</label>
              <select className="form-input" value={form.certificate_provided ? 'yes' : 'no'} onChange={e => set('certificate_provided', e.target.value === 'yes')}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description *</label>
              <textarea className={`form-input form-textarea ${errors.description ? 'error' : ''}`} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed workshop description..." rows={3} />
              {errors.description && <span style={{ fontSize: 12, color: 'var(--error-600)' }}>{errors.description}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid var(--neutral-100)' }}>
            <button type="button" className="btn btn-ghost" onClick={createModal.close}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update Workshop' : 'Create Workshop'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Delete Workshop" size="sm">
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
          <p style={{ color: 'var(--neutral-600)', marginBottom: 24 }}>Delete <strong>{deleteModal.data?.title}</strong>?</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={deleteModal.close}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
