import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, Avatar, ScoreBar } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getBadgeInfo, getScoreColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './TeacherProfile.module.css';

const formLabel = {
  color: 'rgba(255,255,255,0.72)',
  fontSize: 13,
  fontWeight: 600,
  display: 'block',
  marginBottom: 6,
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: '0.01em',
};

const darkInput = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: '#e2e8f0',
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
};

export default function TeacherProfile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', bio: '', specialization: '' });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    teacherAPI.getProfile()
      .then(res => {
        setProfileData(res.data.data);
        const u = res.data.data.user;
        setForm({
          name: u.name || '',
          phone: u.phone || '',
          bio: u.bio || '',
          specialization: u.specialization || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const res = await teacherAPI.updateProfile(fd);
      updateUser(res.data.data);
      toast.success('Profile updated!');
      setEditing(false);
      setAvatarFile(null);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const u = profileData?.user;
  const ps = profileData?.performance_score;
  const badgeInfo = getBadgeInfo(ps?.badge);

  return (
    <DashboardLayout title="My Profile" subtitle="View and manage your professional profile">
      <div className={styles.page}>
        <div className={styles.profileGrid}>

          {/* Left: Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrap}>
                <Avatar name={u?.name} src={avatarPreview || u?.avatar} size="xl" />
                {editing && (
                  <label className={styles.avatarUpload} title="Change photo">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
              <h2 className={styles.profileName}>{u?.name}</h2>
              <p className={styles.profileDesig}>{u?.designation}</p>
              <p className={styles.profileDept}>{u?.department}</p>
              {ps && (
                <div
                  className={styles.badgePill}
                  style={{ background: badgeInfo.bg, color: badgeInfo.color }}
                >
                  {badgeInfo.icon} {badgeInfo.label}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className={styles.profileStats}>
              {[
                { label: 'Experience', value: `${u?.experience_years || 0} yrs` },
                { label: 'Avg Rating', value: `${profileData?.avg_rating || 0}/5` },
                { label: 'Achievements', value: profileData?.total_achievements || 0 },
                { label: 'Workshops', value: profileData?.total_workshops || 0 },
              ].map(s => (
                <div key={s.label} className={styles.profileStat}>
                  <span className={styles.profileStatVal}>{s.value}</span>
                  <span className={styles.profileStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className={styles.profileInfo}>
              {[
                { icon: '✉️', value: u?.email },
                { icon: '📱', value: u?.phone || 'Not provided' },
                { icon: '🪪', value: u?.employee_id },
                { icon: '🎓', value: u?.qualification },
                { icon: '🔬', value: u?.specialization || 'Not specified' },
              ].map((item, i) => (
                <div key={i} className={styles.infoItem}>
                  <span>{item.icon}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  transition: 'opacity 0.2s ease',
                }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Right Panel */}
          <div className={styles.rightPanel}>
            {editing ? (
              <div className={styles.card}>
                <h3 className={styles.cardTitle} style={{ marginBottom: 20 }}>Edit Profile</h3>
                <form
                  onSubmit={handleSave}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  <div>
                    <label style={formLabel}>Full Name</label>
                    <input
                      style={darkInput}
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label style={formLabel}>Phone Number</label>
                    <input
                      style={darkInput}
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div>
                    <label style={formLabel}>Specialization</label>
                    <input
                      style={darkInput}
                      value={form.specialization}
                      onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                      placeholder="Your area of expertise"
                    />
                  </div>
                  <div>
                    <label style={formLabel}>Bio / About</label>
                    <textarea
                      style={{ ...darkInput, resize: 'vertical', minHeight: 100 }}
                      value={form.bio}
                      onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      rows={4}
                      placeholder="Brief about yourself..."
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      justifyContent: 'flex-end',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      paddingTop: 16,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      style={{
                        padding: '9px 20px',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.65)',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 9,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: '9px 22px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 9,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.65 : 1,
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {u?.bio && (
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>About Me</h3>
                    <p style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.75,
                      marginTop: 14,
                    }}>
                      {u.bio}
                    </p>
                  </div>
                )}

                {ps && (
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Performance Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
                      <ScoreBar label="Student Rating"     value={Math.round(ps.student_rating_score    || 0)} color="#6366f1" />
                      <ScoreBar label="Attendance"         value={Math.round(ps.attendance_score         || 0)} color="#22c55e" />
                      <ScoreBar label="Achievements"       value={Math.round(ps.achievement_score        || 0)} color="#fbbf24" />
                      <ScoreBar label="Workshops"          value={Math.round(ps.workshop_score           || 0)} color="#a78bfa" />
                      <ScoreBar label="Feedback Sentiment" value={Math.round(ps.feedback_sentiment_score || 0)} color="#f97316" />
                    </div>
                    <div style={{
                      marginTop: 18,
                      padding: '12px 16px',
                      background: 'rgba(99,102,241,0.08)',
                      borderRadius: 10,
                      border: '1px solid rgba(99,102,241,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Overall Score</span>
                      <span style={{
                        fontWeight: 800,
                        fontSize: 18,
                        color: '#a5b4fc',
                        fontFamily: "'Sora', sans-serif",
                      }}>
                        {ps.overall_score?.toFixed(1)}% ({ps.grade})
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}