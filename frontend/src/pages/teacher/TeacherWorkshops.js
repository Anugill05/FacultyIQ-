import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, EmptyState, Badge } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { formatDate, workshopCategories } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './TeacherWorkshops.module.css';

const modeColors = { online: 'primary', offline: 'success', hybrid: 'warning' };

export default function TeacherWorkshops() {
  const [upcoming, setUpcoming] = useState([]);
  const [myWorkshops, setMyWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [tab, setTab] = useState('available');

  useEffect(() => {
    Promise.all([
      teacherAPI.getMyWorkshops(),
      fetch('http://localhost:8000/api/v1/workshops', {
        headers: { Authorization: `Bearer ${localStorage.getItem('facultyup_token')}` }
      }).then(r => r.json()).catch(() => ({ data: { data: [] } }))
    ]).then(([myRes, allRes]) => {
      setMyWorkshops(myRes.data.data || []);
      setUpcoming((allRes.data?.data || []).filter(w => w.status === 'upcoming'));
    }).finally(() => setLoading(false));
  }, []);

  const joinedIds = myWorkshops.map(p => p.workshop_id || p.workshop?.id).filter(Boolean);

  const handleJoin = async (workshopId) => {
    setJoining(workshopId);
    try {
      await teacherAPI.joinWorkshop(workshopId);
      toast.success('Registered successfully!');
      const myRes = await teacherAPI.getMyWorkshops();
      setMyWorkshops(myRes.data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not join workshop');
    } finally {
      setJoining(null);
    }
  };

  const completedWorkshops = myWorkshops.filter(p => p.status === 'completed');
  const registeredWorkshops = myWorkshops.filter(p => p.status === 'registered');
  const totalPoints = completedWorkshops.reduce((s, p) => s + (p.workshop?.points_awarded || 0), 0);

  return (
    <DashboardLayout title="Workshops & Training" subtitle="Browse, join, and track professional development programs">
      <div className={styles.page}>
        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { icon: '🎯', label: 'Registered', val: registeredWorkshops.length, color: '#2563eb' },
            { icon: '✅', label: 'Completed', val: completedWorkshops.length, color: '#16a34a' },
            { icon: '⭐', label: 'Points Earned', val: totalPoints, color: '#d97706' },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statVal} style={{ color: s.color }}>{s.val}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'available' ? styles.tabActive : ''}`} onClick={() => setTab('available')}>
            Available Workshops
          </button>
          <button className={`${styles.tab} ${tab === 'mine' ? styles.tabActive : ''}`} onClick={() => setTab('mine')}>
            My Workshops
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading workshops..." />
        ) : tab === 'available' ? (
          upcoming.length === 0 ? (
            <EmptyState icon="🎯" title="No upcoming workshops" description="Check back soon for new programs." />
          ) : (
            <div className={styles.workshopsGrid}>
              {upcoming.map((w, i) => {
                const isJoined = joinedIds.includes(w.id);
                const isFull = w.current_participants >= w.max_participants;
                return (
                  <div key={w.id} className={styles.workshopCard} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardMeta}>
                        <Badge variant={modeColors[w.mode] || 'neutral'}>{w.mode}</Badge>
                        <span className={styles.category}>{workshopCategories[w.category] || w.category}</span>
                      </div>
                      <span className={styles.points}>+{w.points_awarded} pts</span>
                    </div>
                    <h3 className={styles.workshopTitle}>{w.title}</h3>
                    <p className={styles.workshopDesc}>{w.description?.slice(0, 110)}...</p>
                    <div className={styles.workshopDetails}>
                      <span>📅 {formatDate(w.start_date)} · {w.start_time}–{w.end_time}</span>
                      <span>📍 {w.venue}</span>
                      <span>👤 {w.facilitator}</span>
                      <div className={styles.seatsRow}>
                        <span>👥 {w.current_participants}/{w.max_participants}</span>
                        <div className={styles.seatsBar}>
                          <div style={{ width: `${(w.current_participants / w.max_participants) * 100}%`, background: isFull ? 'var(--error-500)' : 'var(--success-500)' }} />
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.deadline}>Deadline: {formatDate(w.registration_deadline)}</span>
                      {w.certificate_provided && <span className={styles.certBadge}>📜 Certificate</span>}
                      <button
                        className={`${styles.joinBtn} ${isJoined ? styles.joinedBtn : ''}`}
                        onClick={() => !isJoined && !isFull && handleJoin(w.id)}
                        disabled={isJoined || isFull || joining === w.id}
                      >
                        {joining === w.id ? '⟳ Joining...' : isJoined ? '✓ Registered' : isFull ? 'Full' : 'Join →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          myWorkshops.length === 0 ? (
            <EmptyState icon="🎯" title="No workshops joined yet" description="Browse available workshops and register." />
          ) : (
            <div className={styles.workshopsGrid}>
              {myWorkshops.map((p, i) => {
                const w = p.workshop;
                if (!w) return null;
                return (
                  <div key={p.id} className={`${styles.workshopCard} ${styles.joinedCard}`} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={styles.cardTop}>
                      <Badge variant={p.status === 'completed' ? 'success' : 'primary'}>
                        {p.status}
                      </Badge>
                      {p.certificate_issued && <span className={styles.certBadge}>📜 Certificate Issued</span>}
                    </div>
                    <h3 className={styles.workshopTitle}>{w.title}</h3>
                    <div className={styles.workshopDetails}>
                      <span>📅 {formatDate(w.start_date)}</span>
                      <span>🎯 {workshopCategories[w.category] || w.category}</span>
                      <span>⭐ +{w.points_awarded} pts</span>
                    </div>
                    {p.completed_at && (
                      <p style={{ fontSize: 12, color: 'var(--success-600)', marginTop: 4 }}>
                        ✓ Completed on {formatDate(p.completed_at)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
