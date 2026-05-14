import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { LoadingSpinner, EmptyState, Avatar, Badge, Pagination } from '../../components/common/Common';
import { adminAPI } from '../../services/api';
import { departments, formatDate } from '../../utils/helpers';
import { useDebounce, useModal } from '../../hooks';
import toast from 'react-hot-toast';
import styles from './AdminTeachers.module.css';

const initialForm = {
  name: '', email: '', employee_id: '', department: '', designation: '',
  qualification: '', specialization: '', experience_years: '', phone: '', bio: '',
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const createModal = useModal();
  const deleteModal = useModal();

  const fetchTeachers = useCallback(() => {
    setLoading(true);
    adminAPI.getTeachers({ search: debouncedSearch, department: deptFilter, page, per_page: 10 })
      .then(res => {
        setTeachers(res.data.data.data || []);
        setTotalPages(res.data.data.last_page || 1);
        setTotal(res.data.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, deptFilter, page]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.employee_id.trim()) e.employee_id = 'Required';
    if (!form.department) e.department = 'Required';
    if (!form.designation.trim()) e.designation = 'Required';
    if (!form.qualification.trim()) e.qualification = 'Required';
    if (!form.experience_years && form.experience_years !== 0) e.experience_years = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editId) {
        await adminAPI.updateTeacher(editId, form);
        toast.success('Teacher updated successfully');
      } else {
        await adminAPI.createTeacher(form);
        toast.success('Teacher created! Welcome email sent.');
      }
      createModal.close();
      setForm(initialForm);
      setEditId(null);
      fetchTeachers();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditId(teacher.id);
    setForm({
      name: teacher.name || '',
      email: teacher.email || '',
      employee_id: teacher.employee_id || '',
      department: teacher.department || '',
      designation: teacher.designation || '',
      qualification: teacher.qualification || '',
      specialization: teacher.specialization || '',
      experience_years: teacher.experience_years || '',
      phone: teacher.phone || '',
      bio: teacher.bio || '',
    });
    setErrors({});
    createModal.open();
  };

  const handleDelete = async () => {
    if (!deleteModal.data) return;
    try {
      await adminAPI.deleteTeacher(deleteModal.data.id);
      toast.success('Teacher removed');
      deleteModal.close();
      fetchTeachers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setErrors({});
    createModal.open();
  };

  return (
    <DashboardLayout title="Faculty Management" subtitle="Create, manage and monitor all faculty accounts">
      <div className={styles.page}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className={styles.filterSelect} value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Faculty</button>
        </div>

        {/* Stats chips */}
        <div className={styles.statsChips}>
          <span className={styles.chip}>Total: <strong>{total}</strong></span>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? <LoadingSpinner text="Loading faculty..." /> : teachers.length === 0 ? (
            <EmptyState icon="👩‍🏫" title="No faculty found" description="Add faculty members or adjust your search." />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Faculty Member</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Experience</th>
                  <th>Performance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className={styles.teacherCell}>
                        <Avatar name={t.name} src={t.avatar} size="sm" />
                        <div>
                          <span className={styles.teacherName}>{t.name}</span>
                          <span className={styles.teacherEmail}>{t.email}</span>
                          <span className={styles.teacherEid}>{t.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.dept}>{t.department}</span></td>
                    <td><span className={styles.desig}>{t.designation}</span></td>
                    <td><span className={styles.exp}>{t.experience_years || 0} yrs</span></td>
                    <td>
                      {t.performance_score ? (
                        <div className={styles.scoreCell}>
                          <span className={styles.scoreVal}>{t.performance_score.overall_score?.toFixed(1)}%</span>
                          <span className={styles.scoreGrade} style={{ color: t.performance_score.grade === 'A+' ? '#16a34a' : '#2563eb' }}>
                            {t.performance_score.grade}
                          </span>
                        </div>
                      ) : <span style={{ color: 'var(--neutral-400)', fontSize: 12 }}>Not assessed</span>}
                    </td>
                    <td>
                      <Badge variant={t.is_active ? 'success' : 'error'}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => handleEdit(t)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => deleteModal.open(t)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} perPage={10} />
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title={editId ? 'Edit Faculty' : 'Add New Faculty'} size="lg">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name *</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Full Name" />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address *</label>
              <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@lpu.in" disabled={!!editId} />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Employee ID *</label>
              <input className={`form-input ${errors.employee_id ? 'error' : ''}`} value={form.employee_id} onChange={e => set('employee_id', e.target.value)} placeholder="CSE001" />
              {errors.employee_id && <span className={styles.error}>{errors.employee_id}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Department *</label>
              <select className={`form-input ${errors.department ? 'error' : ''}`} value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className={styles.error}>{errors.department}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Designation *</label>
              <select className={`form-input ${errors.designation ? 'error' : ''}`} value={form.designation} onChange={e => set('designation', e.target.value)}>
                <option value="">Select Designation</option>
                {['Assistant Professor', 'Associate Professor', 'Professor', 'Senior Professor', 'HOD', 'Dean'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.designation && <span className={styles.error}>{errors.designation}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Qualification *</label>
              <input className={`form-input ${errors.qualification ? 'error' : ''}`} value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="Ph.D. in Computer Science" />
              {errors.qualification && <span className={styles.error}>{errors.qualification}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Specialization</label>
              <input className="form-input" value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="Machine Learning, AI..." />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Experience (Years) *</label>
              <input type="number" min="0" max="50" className={`form-input ${errors.experience_years ? 'error' : ''}`} value={form.experience_years} onChange={e => set('experience_years', e.target.value)} placeholder="8" />
              {errors.experience_years && <span className={styles.error}>{errors.experience_years}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className={styles.formGroup} style={{ marginTop: 8 }}>
            <label className={styles.label}>Bio / About</label>
            <textarea className="form-input form-textarea" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief description about the faculty member..." rows={3} />
          </div>
          <div className={styles.formActions}>
            <button type="button" className="btn btn-ghost" onClick={createModal.close}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update Faculty' : 'Create & Send Email'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Confirm Delete" size="sm">
        <div className={styles.deleteConfirm}>
          <div className={styles.deleteIcon}>⚠️</div>
          <p className={styles.deleteText}>
            Are you sure you want to remove <strong>{deleteModal.data?.name}</strong>? This action cannot be undone.
          </p>
          <div className={styles.formActions}>
            <button className="btn btn-ghost" onClick={deleteModal.close}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
