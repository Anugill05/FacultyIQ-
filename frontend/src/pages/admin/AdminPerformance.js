import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar, Badge, Pagination, ScoreBar } from '../../components/common/Common';
import { adminAPI } from '../../services/api';
import { getScoreColor, getBadgeInfo, getGradeColor, getAcademicYears, departments } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import styles from './AdminPerformance.module.css';

const COLORS = ['#1e3a8a','#2563eb','#ea580c','#d97706','#16a34a','#7c3aed'];

export default function AdminPerformance() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ academic_year: '2024-2025', semester: '1', department: '' });

  const fetchReports = useCallback(() => {
    setLoading(true);
    adminAPI.getPerformanceReports({ ...filters, page, per_page: 10 })
      .then(res => {
        setScores(res.data.data.data || []);
        setTotalPages(res.data.data.last_page || 1);
        setTotal(res.data.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await adminAPI.generatePerformance({ academic_year: filters.academic_year, semester: parseInt(filters.semester) });
      toast.success('Performance scores calculated for all faculty!');
      fetchReports();
    } catch {
      toast.error('Failed to generate performance reports');
    } finally {
      setGenerating(false);
    }
  };

  const chartData = scores.slice(0, 8).map(s => ({
    name: s.teacher?.name?.split(' ').slice(-1)[0] || '?',
    score: Math.round(s.overall_score || 0),
  }));

  return (
    <DashboardLayout title="Performance Reports" subtitle="Faculty performance assessment and analytics">
      <div className={styles.page}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Academic Year</label>
            <select className={styles.filterInput} value={filters.academic_year}
              onChange={e => setFilters(p => ({ ...p, academic_year: e.target.value }))}>
              {getAcademicYears().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Semester</label>
            <select className={styles.filterInput} value={filters.semester}
              onChange={e => setFilters(p => ({ ...p, semester: e.target.value }))}>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Department</label>
            <select className={styles.filterInput} value={filters.department}
              onChange={e => setFilters(p => ({ ...p, department: e.target.value }))}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? '⟳ Calculating...' : '⚡ Generate Report'}
          </button>
        </div>

        {/* Score Distribution Chart */}
        {scores.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Top Faculty Performance Scores</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip formatter={v => [`${v}%`, 'Score']}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                <Bar dataKey="score" radius={[5, 5, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Results Table */}
        <div className={styles.tableWrap}>
          {loading ? <LoadingSpinner text="Loading reports..." /> : scores.length === 0 ? (
            <EmptyState icon="📊" title="No performance data"
              description="Click 'Generate Report' to calculate performance scores for all faculty."
              action={<button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>Generate Now</button>} />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Faculty Member</th>
                  <th>Overall Score</th>
                  <th>Breakdown</th>
                  <th>Grade</th>
                  <th>Badge</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => {
                  const badgeInfo = getBadgeInfo(s.badge);
                  return (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--neutral-400)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {(page - 1) * 10 + i + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={s.teacher?.name} src={s.teacher?.avatar} size="sm" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{s.teacher?.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{s.teacher?.department}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.scoreMain}>
                          <span className={styles.scoreNum} style={{ color: getScoreColor(s.overall_score) }}>
                            {s.overall_score?.toFixed(1)}%
                          </span>
                          <div className={styles.scoreMini}>
                            <div style={{ width: `${s.overall_score}%`, background: getScoreColor(s.overall_score) }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.breakdown}>
                          <span title="Student Rating">⭐ {s.student_rating_score?.toFixed(0)}%</span>
                          <span title="Attendance">✅ {s.attendance_score?.toFixed(0)}%</span>
                          <span title="Achievements">🏅 {s.achievement_score?.toFixed(0)}%</span>
                          <span title="Workshops">🎯 {s.workshop_score?.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.grade} style={{ color: getGradeColor(s.grade), background: `${getGradeColor(s.grade)}18` }}>
                          {s.grade}
                        </span>
                      </td>
                      <td>
                        <span className={styles.badge} style={{ background: badgeInfo.bg, color: badgeInfo.color }}>
                          {badgeInfo.icon} {badgeInfo.label}
                        </span>
                      </td>
                      <td>
                        <span className={styles.rank}>#{s.rank_in_department || '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} perPage={10} />
      </div>
    </DashboardLayout>
  );
}
