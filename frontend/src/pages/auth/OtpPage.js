import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

const IconMail = () => (
  <svg className={styles.otpIconSvg} viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function OtpPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { updateUser } = useAuth();

  const { userId, email } = location.state || {};
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef([]);

  useEffect(() => { if (!userId) navigate('/login'); }, [userId, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft'  && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp({ user_id: userId, otp: otpString });
      if (res.data.success) {
        localStorage.setItem('facultyup_token', res.data.token);
        localStorage.setItem('facultyup_user', JSON.stringify(res.data.user));
        updateUser(res.data.user);
        toast.success('Email verified! Welcome to FacultyUp.');
        const map = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
        navigate(map[res.data.user.role] || '/');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    setResending(true);
    try {
      await authAPI.resendOtp({ email });
      toast.success('OTP resent to your email!');
      setCountdown(60);
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const filled = otp.filter(Boolean).length;

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

          <h2 className={styles.authHeading}>Almost there!<br />Verify your email</h2>
          <p className={styles.authSubheading}>
            We've sent a 6-digit OTP to your email address. Enter it to activate your account and start your journey.
          </p>

          <div className={styles.otpInfoCard}>
            <p className={styles.otpInfoLabel}>Sending OTP to</p>
            <p className={styles.otpInfoEmail}>{email || 'your email'}</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className={styles.authRight}>
        <div className={styles.authFormWrap}>

          <div className={styles.otpCenterHeader}>
            <div className={`${styles.otpIconWrap} ${styles.floatAnim}`}>
              <IconMail />
            </div>
            <h2 className={styles.formTitle}>Enter OTP</h2>
            <p className={styles.formSubtitle}>
              6-digit code sent to <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.otpRow} onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoComplete="off"
                  placeholder="·"
                />
              ))}
            </div>

            {/* Progress hint */}
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '-4px' }}>
              {filled === 6 ? 'All digits entered' : `${filled} of 6 digits entered`}
            </p>

            <div className={styles.resendRow}>
              {countdown > 0 ? (
                <span className={styles.timerText}>
                  Resend OTP in <strong>{countdown}s</strong>
                </span>
              ) : (
                <button type="button" className={styles.resendBtn} onClick={handleResend} disabled={resending}>
                  {resending ? 'Sending...' : '↻ Resend OTP'}
                </button>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? <><span className={styles.btnSpinner} /> Verifying...</> : 'Verify & Continue →'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Wrong email? <Link to="/register">Register again</Link>
          </p>
        </div>
      </div>
    </div>
  );
}