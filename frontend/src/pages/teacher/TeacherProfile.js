import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner, Avatar, Badge, ScoreBar, StarRating } from '../../components/common/Common';
import { teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { departments, getBadgeInfo, getScoreColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './TeacherProfile.module.css';

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
        setForm({ name: u.name || '', phone: u.phone || '', bio: u.bio || '', specialization: u.specialization || '' });
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
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout title="My Profile"><LoadingSpinner /></DashboardLayout>;

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
                  <label className={styles.avatarUpload}>
                    📷
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <h2 className={styles.profileName}>{u?.name}</h2>
              <p className={styles.profileDesig}>{u?.designation}</p>
              <p className={styles.profileDept}>{u?.department}</p>
              {ps && (
                <div className={styles.badgePill} style={{ background: badgeInfo.bg, color: badgeInfo.color }}>
                  {badgeInfo.icon} {badgeInfo.label}
                </div>
              )}
            </div>

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

            <div className={styles.profileInfo}>
              <div className={styles.infoItem}><span>✉️</span><span>{u?.email}</span></div>
              <div className={styles.infoItem}><span>📱</span><span>{u?.phone || 'Not provided'}</span></div>
              <div className={styles.infoItem}><span>🪪</span><span>{u?.employee_id}</span></div>
              <div className={styles.infoItem}><span>🎓</span><span>{u?.qualification}</span></div>
              <div className={styles.infoItem}><span>🔬</span><span>{u?.specialization || 'Not specified'}</span></div>
            </div>

            {!editing && (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {/* Right: Edit Form / Performance */}
          <div className={styles.rightPanel}>
            {editing ? (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Edit Profile</h3>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                  <div>
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Specialization</label>
                    <input className="form-input" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="Your area of expertise" />
                  </div>
                  <div>
                    <label className="form-label">Bio / About</label>
                    <textarea className="form-input form-textarea" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={4} placeholder="Brief about yourself..." />
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
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
                    <p style={{ fontSize: 14, color: 'var(--neutral-600)', lineHeight: 1.7, marginTop: 12 }}>{u.bio}</p>
                  </div>
                )}
                {ps && (
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Performance Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                      <ScoreBar label="Student Rating" value={Math.round(ps.student_rating_score || 0)} color="#2563eb" />
                      <ScoreBar label="Attendance" value={Math.round(ps.attendance_score || 0)} color="#16a34a" />
                      <ScoreBar label="Achievements" value={Math.round(ps.achievement_score || 0)} color="#d97706" />
                      <ScoreBar label="Workshops" value={Math.round(ps.workshop_score || 0)} color="#7c3aed" />
                      <ScoreBar label="Feedback Sentiment" value={Math.round(ps.feedback_sentiment_score || 0)} color="#ea580c" />
                    </div>
                    <div style={{ marginTop: 16, padding: 12, background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--neutral-600)' }}>Overall Score</span>
                      <span style={{ fontWeight: 800, fontSize: 18, color: getScoreColor(ps.overall_score), fontFamily: 'var(--font-mono)' }}>
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
