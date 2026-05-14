// AdminStudents.js
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar, Badge, Pagination } from '../../components/common/Common';
import { adminAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { useDebounce } from '../../hooks';
import styles from './AdminTeachers.module.css';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(search, 400);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    adminAPI.getStudents({ search: debouncedSearch, page, per_page: 12 })
      .then(res => {
        setStudents(res.data.data.data || []);
        setTotalPages(res.data.data.last_page || 1);
        setTotal(res.data.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <DashboardLayout title="Student Management" subtitle="View all registered student accounts">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input className={styles.searchInput} placeholder="Search by name, email, ID..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <div className={styles.statsChips}>
          <span className={styles.chip}>Total Students: <strong>{total}</strong></span>
        </div>
        <div className={styles.tableWrap}>
          {loading ? <LoadingSpinner text="Loading students..." /> : students.length === 0 ? (
            <EmptyState icon="🎓" title="No students found" />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.teacherCell}>
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <span className={styles.teacherName}>{s.name}</span>
                          <span className={styles.teacherEmail}>{s.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{s.student_id}</span></td>
                    <td>{s.department}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{formatDate(s.created_at)}</td>
                    <td><Badge variant={s.is_active ? 'success' : 'error'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} perPage={12} />
      </div>
    </DashboardLayout>
  );
}
