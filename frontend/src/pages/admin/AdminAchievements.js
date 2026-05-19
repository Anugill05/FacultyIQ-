import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Avatar, Badge } from '../../components/common/Common';
import { adminAPI } from '../../services/api';
import { formatDate, achievementCategories } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './AdminAchievements.module.css';

// FIX: resolve whichever ID field the backend actually returns
const getId = (a) => a.id ?? a._id ?? a.achievement_id ?? null;

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null); // stores the resolved ID, never undefined

  const fetchPending = useCallback(() => {
    setLoading(true);
    adminAPI.getPendingAchievements()
      .then(res => {
        const list = res.data.data || [];

        // TEMP DEBUG — remove once verified working
        if (list.length > 0) {
          console.log('[AdminAchievements] First achievement keys:', Object.keys(list[0]));
          console.log('[AdminAchievements] First achievement:', list[0]);
        }

        setAchievements(list);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleVerify = async (achievementId) => {
    // FIX: guard — bail immediately if ID is missing instead of calling the API with undefined
    if (achievementId === undefined || achievementId === null) {
      console.error('[AdminAchievements] handleVerify called with invalid id:', achievementId);
      toast.error('Invalid achievement ID. Please refresh and try again.');
      return;
    }

    setVerifying(achievementId);
    try {
      await adminAPI.verifyAchievement(achievementId);
      toast.success('Achievement verified!');
      // FIX: filter by resolved ID, not a.id, so removal always works
      setAchievements(prev => prev.filter(a => getId(a) !== achievementId));
    } catch (err) {
      const msg = err?.response?.data?.message || 'Verification failed';
      const status = err?.response?.status;
      console.error(`[AdminAchievements] Verify error ${status}:`, err?.response?.data);
      toast.error(msg);
    } finally {
      setVerifying(null);
    }
  };

  const categoryColors = {
    publication:   { bg: '#dbeafe', color: '#1e40af', icon: '📄' },
    award:         { bg: '#fef3c7', color: '#92400e', icon: '🏆' },
    certification: { bg: '#dcfce7', color: '#166534', icon: '📜' },
    conference:    { bg: '#ede9fe', color: '#5b21b6', icon: '🎙️' },
    patent:        { bg: '#ffedd5', color: '#9a3412', icon: '💡' },
    project:       { bg: '#f0fdf4', color: '#14532d', icon: '🔬' },
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
              // FIX: resolve ID once per card — never use a.id directly after this
              const achievementId = getId(a);
              const cat = categoryColors[a.category] || { bg: '#f1f5f9', color: '#475569', icon: '🎖' };
              // FIX: compare against resolved achievementId, not a.id
              const isVerifying = verifying === achievementId;

              return (
                <div key={achievementId ?? i} className={styles.achievementCard} style={{ animationDelay: `${i * 0.06}s` }}>
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
                        <a
                          href={`${process.env.REACT_APP_BASE_URL}/storage/${a.certificate_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.certLink}
                        >
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
                      // FIX: pass resolved achievementId, not a.id inline
                      onClick={() => handleVerify(achievementId)}
                      disabled={isVerifying || verifying !== null}
                    >
                      {isVerifying ? '⟳ Verifying...' : '✓ Verify'}
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