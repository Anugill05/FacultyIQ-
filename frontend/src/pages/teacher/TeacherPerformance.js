import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, ScoreBar } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { getScoreColor, getBadgeInfo, getGradeColor, formatDate } from '../../utils/helpers';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import styles from './TeacherPerformance.module.css';

export default function TeacherPerformance() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.getPerformanceHistory()
      .then(res => setScores(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const latest = scores[0];
  const badgeInfo = getBadgeInfo(latest?.badge);

  const lineData = [...scores].reverse().map(s => ({
    label: `${s.academic_year} S${s.semester}`,
    score: s.overall_score || 0,
  }));

  const radarData = latest ? [
    { subject: 'Rating', A: latest.student_rating_score || 0 },
    { subject: 'Attendance', A: latest.attendance_score || 0 },
    { subject: 'Research', A: latest.achievement_score || 0 },
    { subject: 'Workshops', A: latest.workshop_score || 0 },
    { subject: 'Sentiment', A: latest.feedback_sentiment_score || 0 },
  ] : [];

  return (
    <DashboardLayout title="Performance History" subtitle="Track your professional growth over time">
      <div className={styles.page}>
        {loading ? <LoadingSpinner text="Loading performance data..." /> : scores.length === 0 ? (
          <EmptyState icon="📊" title="No performance data yet"
            description="Performance scores are calculated by the admin. Check back after assessment." />
        ) : (
          <>
            {/* Latest Score Hero */}
            <div className={styles.heroCard}>
              <div className={styles.heroLeft}>
                <p className={styles.heroLabel}>Latest Overall Score</p>
                <div className={styles.heroScore} style={{ color: getScoreColor(latest?.overall_score) }}>
                  {latest?.overall_score?.toFixed(1)}%
                </div>
                <div className={styles.heroMeta}>
                  <span className={styles.grade} style={{ color: getGradeColor(latest?.grade), background: `${getGradeColor(latest?.grade)}18` }}>
                    Grade: {latest?.grade}
                  </span>
                  <span className={styles.badge} style={{ background: badgeInfo.bg, color: badgeInfo.color }}>
                    {badgeInfo.icon} {badgeInfo.label}
                  </span>
                </div>
                <p className={styles.heroMeta2}>
                  {latest?.academic_year} · Semester {latest?.semester} · Rank #{latest?.rank_in_department}
                </p>
                <p className={styles.calcDate}>Calculated: {formatDate(latest?.calculated_at)}</p>
              </div>
              <div className={styles.heroRight}>
                <div className={styles.componentScores}>
                  <h4 className={styles.componentTitle}>Score Components</h4>
                  <div className={styles.componentWeights}>
                    <div className={styles.weight}><span>⭐ Student Rating</span><span>30%</span></div>
                    <div className={styles.weight}><span>📅 Attendance</span><span>20%</span></div>
                    <div className={styles.weight}><span>🏅 Achievements</span><span>25%</span></div>
                    <div className={styles.weight}><span>🎯 Workshops</span><span>15%</span></div>
                    <div className={styles.weight}><span>💬 Feedback</span><span>10%</span></div>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <ScoreBar label="Student Rating" value={Math.round(latest?.student_rating_score || 0)} color="#2563eb" />
                    <ScoreBar label="Attendance" value={Math.round(latest?.attendance_score || 0)} color="#16a34a" />
                    <ScoreBar label="Achievements" value={Math.round(latest?.achievement_score || 0)} color="#d97706" />
                    <ScoreBar label="Workshops" value={Math.round(latest?.workshop_score || 0)} color="#7c3aed" />
                    <ScoreBar label="Feedback" value={Math.round(latest?.feedback_sentiment_score || 0)} color="#ea580c" />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chartsRow}>
              {/* Line Chart - Score history */}
              {lineData.length > 1 && (
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Score Trend</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={lineData} margin={{ top: 8, right: 16, left: -20, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip
                        formatter={v => [`${v.toFixed(1)}%`, 'Score']}
                        contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={2.5}
                        dot={{ fill: '#1e3a8a', r: 5 }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Radar Chart */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Skill Radar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Radar dataKey="A" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* All Scores History Table */}
            {scores.length > 1 && (
              <div className={styles.historyCard}>
                <h3 className={styles.chartTitle} style={{ marginBottom: 16 }}>Score History</h3>
                <div className={styles.historyTable}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr>
                        {['Academic Year','Sem','Overall','Rating','Attendance','Achievements','Workshops','Grade','Badge'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--neutral-400)', background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((s, i) => {
                        const bi = getBadgeInfo(s.badge);
                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.academic_year}</td>
                            <td style={{ padding: '12px 14px' }}>{s.semester}</td>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: getScoreColor(s.overall_score), fontFamily: 'var(--font-mono)' }}>
                              {s.overall_score?.toFixed(1)}%
                            </td>
                            <td style={{ padding: '12px 14px' }}>{s.student_rating_score?.toFixed(0)}%</td>
                            <td style={{ padding: '12px 14px' }}>{s.attendance_score?.toFixed(0)}%</td>
                            <td style={{ padding: '12px 14px' }}>{s.achievement_score?.toFixed(0)}%</td>
                            <td style={{ padding: '12px 14px' }}>{s.workshop_score?.toFixed(0)}%</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ fontWeight: 800, color: getGradeColor(s.grade), background: `${getGradeColor(s.grade)}18`, padding: '2px 8px', borderRadius: '999px', fontFamily: 'var(--font-mono)' }}>{s.grade}</span>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ fontSize: 12, background: bi.bg, color: bi.color, padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                                {bi.icon} {bi.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
