import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar, StarRating, Badge, Pagination } from '../../components/common/Common';
import { studentAPI } from '../../services/api';
import { departments, getScoreColor, getBadgeInfo } from '../../utils/helpers';
import { useDebounce } from '../../hooks';
import styles from './StudentTeachers.module.css';

/* ─── SVG Icons ──────────────────────────────────────────── */

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────── */

export default function StudentTeachers() {
  const [teachers, setTeachers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [deptFilter, setDeptFilter]   = useState('');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const debouncedSearch = useDebounce(search, 400);

  const fetchTeachers = useCallback(() => {
    setLoading(true);
    studentAPI.getTeachers({ search: debouncedSearch, department: deptFilter, page, per_page: 12 })
      .then(res => {
        setTeachers(res.data.data.data || []);
        setTotalPages(res.data.data.last_page || 1);
        setTotal(res.data.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, deptFilter, page]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  return (
    <DashboardLayout title="Faculty Directory" subtitle="Browse and rate your teachers">
      <div className={styles.page}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><IconSearch /></span>
            <input
              className={styles.searchInput}
              placeholder="Search by name or specialization..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <p className={styles.resultsCount}>{total} faculty member{total !== 1 ? 's' : ''} found</p>

        {loading ? (
          <LoadingSpinner text="Loading faculty..." />
        ) : teachers.length === 0 ? (
          <EmptyState title="No faculty found" description="Try adjusting your search or filter." />
        ) : (
          <div className={styles.teachersGrid}>
            {teachers.map((t, i) => (
              <Link
                key={t.id}
                to={`/student/teachers/${t.id}`}
                className={styles.teacherCard}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className={styles.cardTop}>
                  <Avatar name={t.name} src={t.avatar} size="lg" />
                  <div
                    className={styles.scoreChip}
                    style={{ color: getScoreColor(t.score), background: `${getScoreColor(t.score)}18` }}
                  >
                    {t.score?.toFixed(0) || 0}%
                  </div>
                </div>

                <div>
                  <h3 className={styles.teacherName}>{t.name}</h3>
                  <p className={styles.teacherDesig}>{t.designation}</p>
                  <p className={styles.teacherDept}>{t.department}</p>
                </div>

                {t.specialization && (
                  <p className={styles.specialization}>{t.specialization}</p>
                )}

                <div className={styles.cardStats}>
                  <div className={styles.ratingRow}>
                    <StarRating value={t.avg_rating} size="sm" />
                    <span className={styles.ratingVal}>{t.avg_rating}</span>
                  </div>
                  <span className={styles.reviewCount}>{t.total_reviews} reviews</span>
                </div>

                <div className={styles.cardMeta}>
                  <span>{t.experience_years || 0} yrs exp</span>
                  <span className={styles.viewProfile}>View Profile →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} perPage={12} />
      </div>
    </DashboardLayout>
  );
}