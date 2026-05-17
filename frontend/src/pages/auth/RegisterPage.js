import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { departments } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

/* ─── SVG Icons ─────────────────────────────────────────── */

const IconUser = () => (
  <svg className={styles.inputIconSvg} viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg className={styles.inputIconSvg} viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconId = () => (
  <svg className={styles.inputIconSvg} viewBox="0 0 24 24">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M16 10h2M16 14h2M6 10h.01M10 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 14s-1 0-1 1h4c0-1-1-1-1-1H8z" />
  </svg>
);

const IconPhone = () => (
  <svg className={styles.inputIconSvg} viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconLock = () => (
  <svg className={styles.inputIconSvg} viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg className={styles.eyeIconSvg} viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg className={styles.eyeIconSvg} viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconGrad = () => (
  <svg className={styles.brandIconSvg} viewBox="0 0 24 24">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

/* ─── Password Strength ──────────────────────────────────── */

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', cls: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw))    score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: 'Weak',   cls: 'Weak'   };
  if (score === 2) return { score: 2, label: 'Fair',   cls: 'Fair'   };
  if (score === 3) return { score: 3, label: 'Good',   cls: 'Good'   };
  return             { score: 4, label: 'Strong', cls: 'Strong' };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', student_id: '', department: '',
    phone: '', password: '', password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter your full name (min 2 chars)';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.student_id.trim()) e.student_id = 'Student ID is required';
    if (!form.department) e.department = 'Select your department';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = 'Must have uppercase letter and number';
    if (form.password !== form.password_confirmation) e.password_confirmation = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      if (res.data.success) {
        toast.success('Account created! Check your email for OTP.');
        navigate('/verify-otp', { state: { userId: res.data.user_id, email: form.email } });
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setErrors(data.errors);
      else toast.error(data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>

      {/* ── Left Panel ── */}
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/" className={styles.backLink}>← Back to Home</Link>

          <div className={styles.authBrand}>
            <div className={styles.brandIcon}><IconGrad /></div>
            <div>
              <h1 className={styles.brandName}>FacultyUp</h1>
              <p className={styles.brandTagline}>Lovely Professional University</p>
            </div>
          </div>

          <h2 className={styles.authHeading}>Join the Faculty<br />Excellence Community</h2>
          <p className={styles.authSubheading}>
            Create your student account to rate teachers, provide meaningful feedback, and contribute to LPU's culture of academic excellence.
          </p>

          <div className={styles.authFeatures}>
            {[
              'Rate and review faculty members',
              'View teacher performance profiles',
              'Access academic announcements',
            ].map((f) => (
              <div key={f} className={styles.authFeatureItem}>
                <span className={styles.authFeatureCheck}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className={styles.authRight}>
        <div className={styles.authFormWrap}>
          <h2 className={styles.formTitle}>Create Account</h2>
          <p className={styles.formSubtitle}>Student registration — email OTP required</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate autoComplete="off">

            {/* Full Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconUser /></span>
                <input
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            {/* Email + Student ID */}
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconMail /></span>
                  <input
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="your@lpu.in"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Student ID</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconId /></span>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.student_id ? styles.inputError : ''}`}
                    placeholder="LPU12345"
                    value={form.student_id}
                    onChange={(e) => set('student_id', e.target.value)}
                  />
                </div>
                {errors.student_id && <span className={styles.error}>{errors.student_id}</span>}
              </div>
            </div>

            {/* Department + Phone */}
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <select
                  className={`${styles.select} ${errors.department ? styles.inputError : ''}`}
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className={styles.error}>{errors.department}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone (Optional)</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconPhone /></span>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* Password + Confirm */}
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconLock /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Min 8 chars, 1 uppercase"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((p) => !p)} aria-label="Toggle password">
                    {showPass ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <>
                    <div className={styles.strengthBar}>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`${styles.strengthSegment} ${
                            i <= pwStrength.score ? styles[`strengthSegment${pwStrength.cls}`] : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`${styles.strengthLabel} ${styles[`strengthLabel${pwStrength.cls}`]}`}>
                      {pwStrength.label}
                    </span>
                  </>
                )}
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconLock /></span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`${styles.input} ${errors.password_confirmation ? styles.inputError : ''}`}
                    placeholder="Repeat password"
                    value={form.password_confirmation}
                    onChange={(e) => set('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((p) => !p)} aria-label="Toggle confirm password">
                    {showConfirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password_confirmation && <span className={styles.error}>{errors.password_confirmation}</span>}
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <><span className={styles.btnSpinner} /> Creating account...</> : 'Create Account & Get OTP →'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}