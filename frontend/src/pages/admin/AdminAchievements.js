import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar, Badge } from '../../components/common/Common';
import { adminAPI } from '../../services/api';
import { formatDate, achievementCategories } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './AdminAchievements.module.css';

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);

  const fetchPending = useCallback(() => {
    setLoading(true);
    adminAPI.getPendingAchievements()
      .then(res => setAchievements(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleVerify = async (id) => {
    setVerifying(id);
    try {
      await adminAPI.verifyAchievement(id);
      toast.success('Achievement verified!');
      setAchievements(prev => prev.filter(a => a.id !== id));
    } catch { toast.error('Verification failed'); }
    finally { setVerifying(null); }
  };

  const categoryColors = {
    publication: { bg: '#dbeafe', color: '#1e40af', icon: '📄' },
    award: { bg: '#fef3c7', color: '#92400e', icon: '🏆' },
    certification: { bg: '#dcfce7', color: '#166534', icon: '📜' },
    conference: { bg: '#ede9fe', color: '#5b21b6', icon: '🎙️' },
    patent: { bg: '#ffedd5', color: '#9a3412', icon: '💡' },
    project: { bg: '#f0fdf4', color: '#14532d', icon: '🔬' },
  };

  return (
    <DashboardLayout title="Achievement Verification" subtitle="Review and verify faculty achievement submissions">
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <span className={styles.pendingCount}>{achievements.length}</span>
            <span className={styles.pendingLabel}>Pending Verification</span>
          </div>
        </div>

        {loading ? <LoadingSpinner text="Loading achievements..." /> : achievements.length === 0 ? (
          <EmptyState icon="✅" title="All caught up!" description="No pending achievement verifications." />
        ) : (
          <div className={styles.achievementsList}>
            {achievements.map((a, i) => {
              const cat = categoryColors[a.category] || { bg: '#f1f5f9', color: '#475569', icon: '🎖' };
              return (
                <div key={a.id} className={styles.achievementCard} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className={styles.catIcon} style={{ background: cat.bg, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className={styles.achievementInfo}>
                    <div className={styles.achievementTop}>
                      <h3 className={styles.achievementTitle}>{a.title}</h3>
                      <span className={styles.catBadge} style={{ background: cat.bg, color: cat.color }}>
                        {achievementCategories[a.category] || a.category}
                      </span>
                    </div>
                    <p className={styles.achievementDesc}>{a.description}</p>
                    <div className={styles.achievementMeta}>
                      <span>🏛️ {a.issuing_organization}</span>
                      <span>📅 {formatDate(a.date_achieved)}</span>
                      <span>🏆 {a.points} points</span>
                      {a.certificate_url && (
                        <a href={`http://localhost:8000/storage/${a.certificate_url}`}
                          target="_blank" rel="noreferrer" className={styles.certLink}>
                          📎 View Certificate
                        </a>
                      )}
                    </div>
                    <div className={styles.teacherInfo}>
                      <Avatar name={a.teacher?.name} size="sm" />
                      <div>
                        <span className={styles.teacherName}>{a.teacher?.name}</span>
                        <span className={styles.teacherDept}>{a.teacher?.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.achievementActions}>
                    <button
                      className={styles.verifyBtn}
                      onClick={() => handleVerify(a.id)}
                      disabled={verifying === a.id}
                    >
                      {verifying === a.id ? '⟳ Verifying...' : '✓ Verify'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
