import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

/* ─── SVG Icons ─────────────────────────────────────────── */

const IconGrad = () => (
  <svg className={styles.brandIconSvg} viewBox="0 0 24 24">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconShieldLock = () => (
  <svg className={styles.forgotIconSvg} viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <rect x="9" y="11" width="6" height="5" rx="1" />
    <path d="M12 11V9a2 2 0 0 1 2-2" />
  </svg>
);

const IconMail = () => (
  <svg className={styles.inputIconSvg} viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconKey = () => (
  <svg className={styles.inputIconSvg} viewBox="0 0 24 24">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(1); // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp]       = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) { setErrors({ email: 'Email is required' }); return; }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      if (res.data.success) {
        setUserId(res.data.user_id);
        toast.success('OTP sent to your email!');
        setStep(2);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!otp || otp.length !== 6) e2.otp = 'Enter 6-digit OTP';
    if (!password || password.length < 8) e2.password = 'Min 8 characters';
    if (password !== passwordConfirmation) e2.passwordConfirmation = 'Passwords do not match';
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        user_id: userId, otp, password, password_confirmation: passwordConfirmation,
      });
      if (res.data.success) {
        toast.success('Password reset! Please login.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>

      {/* ── Left Panel ── */}
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/login" className={styles.backLink}>← Back to Login</Link>

          <div className={styles.authBrand}>
            <div className={styles.brandIcon}><IconGrad /></div>
            <div>
              <h1 className={styles.brandName}>FacultyUp</h1>
              <p className={styles.brandTagline}>Lovely Professional University</p>
            </div>
          </div>

          <h2 className={styles.authHeading}>Reset your<br />password securely</h2>
          <p className={styles.authSubheading}>
            Enter your registered email and we'll send you a one-time code to reset your password safely.
          </p>

          {/* Step progress on left */}
          <div style={{ marginTop: '32px' }}>
            {[
              { n: 1, label: 'Enter your email' },
              { n: 2, label: 'Set new password' },
            ].map(({ n, label }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className={`${styles.stepDot} ${step === n ? styles.stepDotActive : step > n ? styles.stepDotDone : ''}`}>
                  {step > n ? '✓' : n}
                </div>
                <span style={{ fontSize: '13px', color: step === n ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)', fontWeight: step === n ? 600 : 400 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className={styles.authRight}>
        <div className={styles.authFormWrap}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className={`${styles.forgotIconWrap} ${styles.floatAnim}`}>
              <IconShieldLock />
            </div>
            <h2 className={styles.formTitle}>
              {step === 1 ? 'Forgot Password' : 'Set New Password'}
            </h2>
            <p className={styles.formSubtitle}>
              {step === 1
                ? "We'll send a one-time code to your registered email"
                : `Enter the code sent to ${email}`}
            </p>
          </div>

          {/* Step Dots */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${step === 1 ? styles.stepDotActive : styles.stepDotDone}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <div className={`${styles.stepLine} ${step > 1 ? styles.stepLineDone : ''}`} />
            <div className={`${styles.stepDot} ${step === 2 ? styles.stepDotActive : ''}`}>
              2
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Registered Email</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconMail /></span>
                  <input
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="your.email@lpu.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <><span className={styles.btnSpinner} /> Sending OTP...</> : 'Send OTP →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className={styles.form}>
              {/* OTP */}
              <div className={styles.formGroup}>
                <label className={styles.label}>6-Digit OTP</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconKey /></span>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.otp ? styles.inputError : ''}`}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrors((p) => ({ ...p, otp: '' })); }}
                  />
                </div>
                {errors.otp && <span className={styles.error}>{errors.otp}</span>}
              </div>

              {/* New Password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconLock /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((p) => !p)} aria-label="Toggle password">
                    {showPass ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IconLock /></span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`${styles.input} ${errors.passwordConfirmation ? styles.inputError : ''}`}
                    placeholder="Repeat password"
                    value={passwordConfirmation}
                    onChange={(e) => { setPasswordConfirmation(e.target.value); setErrors((p) => ({ ...p, passwordConfirmation: '' })); }}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((p) => !p)} aria-label="Toggle confirm password">
                    {showConfirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.passwordConfirmation && <span className={styles.error}>{errors.passwordConfirmation}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <><span className={styles.btnSpinner} /> Resetting...</> : 'Reset Password →'}
              </button>
            </form>
          )}

          <p className={styles.switchLink}><Link to="/login">← Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}