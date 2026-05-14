import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

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
        toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
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
      admin: { email: 'admin@lpu.in', password: 'Admin@123' },
      teacher: { email: 'priya.sharma@lpu.in', password: 'Teacher@123' },
      student: { email: 'student1@lpu.in', password: 'Student@123' },
    };
    setForm(demos[role]);
    setErrors({});
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/" className={styles.backLink}>← Back to Home</Link>
          <div className={styles.authBrand}>
            <div className={styles.brandIcon}>🎓</div>
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
            {['Real-time performance analytics', 'Peer feedback & recognition', 'Workshop & growth tracking'].map((f) => (
              <div key={f} className={styles.authFeatureItem}>
                <span className={styles.authFeatureCheck}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.authFormWrap}>
          <h2 className={styles.formTitle}>Sign In</h2>
          <p className={styles.formSubtitle}>Enter your LPU credentials to continue</p>

          {/* Demo buttons */}
          <div className={styles.demoRow}>
            <span className={styles.demoLabel}>Quick demo:</span>
            {['admin', 'teacher', 'student'].map(role => (
              <button key={role} type="button" className={styles.demoBtn} onClick={() => fillDemo(role)}>
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>✉</span>
                <input
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="your.email@lpu.in"
                  value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? '🙈' : '👁'}
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
