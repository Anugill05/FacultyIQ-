import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
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
        user_id: userId, otp, password, password_confirmation: passwordConfirmation
      });
      if (res.data.success) {
        toast.success('Password reset! Please login with your new password.');
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
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/login" className={styles.backLink}>← Back to Login</Link>
          <div className={styles.authBrand}>
            <div className={styles.brandIcon}>🎓</div>
            <div>
              <h1 className={styles.brandName}>FacultyUp</h1>
              <p className={styles.brandTagline}>Lovely Professional University</p>
            </div>
          </div>
          <h2 className={styles.authHeading}>Reset your<br />password securely</h2>
          <p className={styles.authSubheading}>
            Enter your registered email and we'll send you an OTP to reset your password safely.
          </p>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.authFormWrap}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
            <h2 className={styles.formTitle}>{step === 1 ? 'Forgot Password' : 'Set New Password'}</h2>
            <p className={styles.formSubtitle}>
              {step === 1 ? "We'll send an OTP to your registered email" : `Enter the OTP sent to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Registered Email</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>✉</span>
                  <input type="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="your.email@lpu.in"
                    value={email} onChange={e => { setEmail(e.target.value); setErrors({}); }} />
                </div>
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <><span className={styles.btnSpinner} /> Sending OTP...</> : 'Send OTP →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>6-Digit OTP</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔑</span>
                  <input type="text" className={`${styles.input} ${errors.otp ? styles.inputError : ''}`}
                    placeholder="Enter OTP" maxLength={6} inputMode="numeric"
                    value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g,'')); setErrors(p => ({ ...p, otp: '' })); }} />
                </div>
                {errors.otp && <span className={styles.error}>{errors.otp}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input type="password" className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Min 8 characters"
                    value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} />
                </div>
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input type="password" className={`${styles.input} ${errors.passwordConfirmation ? styles.inputError : ''}`}
                    placeholder="Repeat password"
                    value={passwordConfirmation} onChange={e => { setPasswordConfirmation(e.target.value); setErrors(p => ({ ...p, passwordConfirmation: '' })); }} />
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
