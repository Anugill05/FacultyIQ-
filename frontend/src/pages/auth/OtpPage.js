import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  const { userId, email } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef([]);

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
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
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
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
    if (otpString.length !== 6) {
      toast.error('Enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp({ user_id: userId, otp: otpString });
      if (res.data.success) {
        localStorage.setItem('facultyup_token', res.data.token);
        localStorage.setItem('facultyup_user', JSON.stringify(res.data.user));
        updateUser(res.data.user);
        toast.success('Email verified! Welcome to FacultyUp 🎉');
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
          <h2 className={styles.authHeading}>Almost there!<br />Verify your email</h2>
          <p className={styles.authSubheading}>
            We've sent a 6-digit OTP to your email address. Enter it to activate your account and start your journey.
          </p>
          <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Sending OTP to</p>
            <p style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{email || 'your email'}</p>
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.authFormWrap}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>✉️</div>
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
                  ref={el => refs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={styles.otpInput}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  autoComplete="off"
                />
              ))}
            </div>

            <div className={styles.resendRow}>
              {countdown > 0 ? (
                <span className={styles.timerText}>Resend OTP in <strong>{countdown}s</strong></span>
              ) : (
                <button type="button" className={styles.resendBtn} onClick={handleResend} disabled={resending}>
                  {resending ? 'Sending...' : '↻ Resend OTP'}
                </button>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading || otp.join('').length !== 6}>
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
