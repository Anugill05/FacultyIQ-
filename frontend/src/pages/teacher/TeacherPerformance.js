import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, ScoreBar } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { getScoreColor, getBadgeInfo, getGradeColor, formatDate } from '../../utils/helpers';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import styles from './TeacherPerformance.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1a1f2e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        color: '#e2e8f0',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 4, fontSize: 11 }}>{label}</div>
        <div style={{ fontWeight: 700, color: '#a5b4fc' }}>{payload[0].value?.toFixed(1)}%</div>
      </div>
    );
  }
  return null;
};

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
    { subject: 'Rating',     A: latest.student_rating_score    || 0 },
    { subject: 'Attendance', A: latest.attendance_score         || 0 },
    { subject: 'Research',   A: latest.achievement_score        || 0 },
    { subject: 'Workshops',  A: latest.workshop_score           || 0 },
    { subject: 'Sentiment',  A: latest.feedback_sentiment_score || 0 },
  ] : [];

  return (
    <DashboardLayout title="Performance History" subtitle="Track your professional growth over time">
      <div className={styles.page}>
        {loading ? (
          <LoadingSpinner text="Loading performance data..." />
        ) : scores.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No performance data yet"
            description="Performance scores are calculated by the admin. Check back after assessment."
          />
        ) : (
          <>
            {/* Hero Score Card */}
            <div className={styles.heroCard}>
              <div className={styles.heroLeft}>
                <p className={styles.heroLabel}>Latest Overall Score</p>
                <div className={styles.heroScore} style={{ color: '#ffffff' }}>
                  {latest?.overall_score?.toFixed(1)}%
                </div>
                <div className={styles.heroMeta}>
                  <span
                    className={styles.grade}
                    style={{
                      color: '#e2e8f0',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    Grade: {latest?.grade}
                  </span>
                  <span
                    className={styles.badge}
                    style={{ background: badgeInfo.bg, color: badgeInfo.color }}
                  >
                    {badgeInfo.icon} {badgeInfo.label}
                  </span>
                </div>
                <p className={styles.heroMeta2}>
                  {latest?.academic_year} · Semester {latest?.semester} · Rank #{latest?.rank_in_department}
                </p>
                <p className={styles.calcDate}>
                  Calculated: {formatDate(latest?.calculated_at)}
                </p>
              </div>

              <div className={styles.heroRight}>
                <div className={styles.componentScores}>
                  <h4 className={styles.componentTitle}>Score Components</h4>
                  <div className={styles.componentWeights}>
                    {[
                      { label: 'Student Rating', pct: '30%' },
                      { label: 'Attendance',     pct: '20%' },
                      { label: 'Achievements',   pct: '25%' },
                      { label: 'Workshops',      pct: '15%' },
                      { label: 'Feedback',       pct: '10%' },
                    ].map(w => (
                      <div key={w.label} className={styles.weight}>
                        <span>{w.label}</span>
                        <span>{w.pct}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <ScoreBar label="Student Rating" value={Math.round(latest?.student_rating_score    || 0)} color="#6366f1" />
                    <ScoreBar label="Attendance"     value={Math.round(latest?.attendance_score         || 0)} color="#22c55e" />
                    <ScoreBar label="Achievements"   value={Math.round(latest?.achievement_score        || 0)} color="#fbbf24" />
                    <ScoreBar label="Workshops"      value={Math.round(latest?.workshop_score           || 0)} color="#a78bfa" />
                    <ScoreBar label="Feedback"       value={Math.round(latest?.feedback_sentiment_score || 0)} color="#f97316" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className={styles.chartsRow}>
              {lineData.length > 1 && (
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Score Trend</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={lineData} margin={{ top: 8, right: 16, left: -20, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ fill: '#6366f1', r: 5, strokeWidth: 0 }}
                        activeDot={{ r: 7, fill: '#a5b4fc' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Skill Radar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} />
                    <Radar
                      dataKey="A"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score History Table */}
            {scores.length > 1 && (
              <div className={styles.historyCard}>
                <h3 className={styles.chartTitle} style={{ marginBottom: 20 }}>Score History</h3>
                <div className={styles.historyTable}>
                  <table>
                    <thead>
                      <tr>
                        {['Academic Year', 'Sem', 'Overall', 'Rating', 'Attendance', 'Achievements', 'Workshops', 'Grade', 'Badge'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((s) => {
                        const bi = getBadgeInfo(s.badge);
                        return (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{s.academic_year}</td>
                            <td>{s.semester}</td>
                            <td style={{ fontWeight: 800, color: '#a5b4fc', fontFamily: "'Sora', sans-serif" }}>
                              {s.overall_score?.toFixed(1)}%
                            </td>
                            <td>{s.student_rating_score?.toFixed(0)}%</td>
                            <td>{s.attendance_score?.toFixed(0)}%</td>
                            <td>{s.achievement_score?.toFixed(0)}%</td>
                            <td>{s.workshop_score?.toFixed(0)}%</td>
                            <td>
                              <span style={{
                                fontWeight: 800,
                                color: '#e2e8f0',
                                background: 'rgba(99,102,241,0.15)',
                                border: '1px solid rgba(99,102,241,0.25)',
                                padding: '2px 10px',
                                borderRadius: '100px',
                                fontFamily: "'Sora', sans-serif",
                                fontSize: 13,
                              }}>
                                {s.grade}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                fontSize: 12,
                                background: bi.bg,
                                color: bi.color,
                                padding: '2px 10px',
                                borderRadius: '100px',
                                fontWeight: 600,
                              }}>
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