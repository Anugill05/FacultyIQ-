import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

/* ─── SVG Icons ─────────────────────────────────────────── */

const IconMail = () => (
  <svg className={styles.inputIconSvg} viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name.replace(/^Dr\.\s*/i, '').split(' ')[0]}!`);
        const map = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
        navigate(map[result.user.role] || '/');
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data?.needs_verification) {
        toast.error('Please verify your email first');
        navigate('/verify-otp', { state: { userId: data.user_id, email: form.email } });
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      admin:   { email: 'admin@lpu.in',         password: 'Admin@123'   },
      teacher: { email: 'priya.sharma@lpu.in',  password: 'Teacher@123' },
      student: { email: 'student1@lpu.in',       password: 'Student@123' },
    };
    setForm(demos[role]);
    setErrors({});
  };

  return (
    <div className={styles.authPage}>

      {/* ── Left Panel ── */}
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/" className={styles.backLink}>← Back to Home</Link>

          <div className={styles.authBrand}>
            <div className={styles.brandIcon}>
              <IconGrad />
            </div>
            <div>
              <h1 className={styles.brandName}>FacultyUp</h1>
              <p className={styles.brandTagline}>Lovely Professional University</p>
            </div>
          </div>

          <h2 className={styles.authHeading}>Welcome back to<br />FacultyUp</h2>
          <p className={styles.authSubheading}>
            Sign in to access your dashboard, track performance, and continue your journey of academic excellence.
          </p>

          <div className={styles.authFeatures}>
            {[
              'Real-time performance analytics',
              'Peer feedback & recognition',
              'Workshop & growth tracking',
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
          <h2 className={styles.formTitle}>Sign In</h2>
          <p className={styles.formSubtitle}>Enter your LPU credentials to continue</p>

          {/* Demo quick-fill */}
          <div className={styles.demoRow}>
            <span className={styles.demoLabel}>Quick demo</span>
            {['admin', 'teacher', 'student'].map((role) => (
              <button key={role} type="button" className={styles.demoBtn} onClick={() => fillDemo(role)}>
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconMail /></span>
                <input
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="your.email@lpu.in"
                  value={form.email}
                  onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: '' })); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconLock /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: '' })); }}
                  autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((p) => !p)} aria-label="Toggle password">
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <><span className={styles.btnSpinner} /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <p className={styles.switchLink}>
            New student? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}