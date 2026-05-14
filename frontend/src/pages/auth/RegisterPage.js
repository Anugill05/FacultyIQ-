import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { departments } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', student_id: '', department: '',
    phone: '', password: '', password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
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
      if (data?.errors) {
        setErrors(data.errors);
      } else {
        toast.error(data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
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
          <h2 className={styles.authHeading}>Join the Faculty<br />Excellence Community</h2>
          <p className={styles.authSubheading}>
            Create your student account to rate teachers, provide meaningful feedback, and contribute to LPU's culture of academic excellence.
          </p>
          <div className={styles.authFeatures}>
            {['Rate and review faculty members', 'View teacher performance profiles', 'Access academic announcements'].map((f) => (
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
          <h2 className={styles.formTitle}>Create Account</h2>
          <p className={styles.formSubtitle}>Student registration — email OTP required</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>👤</span>
                <input type="text" className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Dr. / Mr. / Ms. Your Name"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>✉</span>
                  <input type="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="your@lpu.in"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Student ID</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🪪</span>
                  <input type="text" className={`${styles.input} ${errors.student_id ? styles.inputError : ''}`}
                    placeholder="LPU12345"
                    value={form.student_id} onChange={e => set('student_id', e.target.value)} />
                </div>
                {errors.student_id && <span className={styles.error}>{errors.student_id}</span>}
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <select className={`${styles.select} ${errors.department ? styles.inputError : ''}`}
                  value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className={styles.error}>{errors.department}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone (Optional)</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>📱</span>
                  <input type="tel" className={styles.input}
                    placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input type={showPass ? 'text' : 'password'}
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Min 8 chars, 1 uppercase"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(p => !p)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input type="password"
                    className={`${styles.input} ${errors.password_confirmation ? styles.inputError : ''}`}
                    placeholder="Repeat password"
                    value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)} />
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
