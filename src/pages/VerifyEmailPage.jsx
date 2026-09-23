import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, Mail, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim() || !email.includes('@')) return setError('Enter a valid email address.');
    if (!/^\d{6}$/.test(otp)) return setError('Enter the 6-digit verification code.');

    setLoading(true);
    try {
      await api.verifyOtp({ email: email.trim(), otp });
      navigate('/login', {
        replace: true,
        state: { message: 'Email verified. You can now sign in.' },
      });
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    if (!email.trim() || !email.includes('@')) return setError('Enter a valid email address.');

    setResending(true);
    try {
      const result = await api.resendOtp({ email: email.trim() });
      setMessage(result.message || 'A new verification code was sent.');
    } catch (err) {
      setError(err.message || 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-logo-glow auth-badge"><Sparkles size={22} className="brand-icon" /></div>
            <h1 className="auth-title">Verify Your Email</h1>
            <p className="auth-subtitle">Enter the 6-digit code sent to your email address.</p>
          </div>

          {message && <div className="alert-banner alert-success"><CheckCircle2 size={18} /><span>{message}</span></div>}
          {error && <div className="alert-banner alert-error" role="alert"><span>{error}</span></div>}

          <form onSubmit={handleVerify} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="verify-email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input id="verify-email" type="email" className="form-input" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading || resending} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="verify-otp">Verification Code</label>
              <input id="verify-otp" type="text" inputMode="numeric" maxLength={6} className="form-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} disabled={loading} autoComplete="one-time-code" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || resending}>
              {loading ? <><Loader2 size={18} className="animate-spin" /><span>Verifying...</span></> : <><span>Verify Email</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <button type="button" className="btn btn-secondary btn-block" onClick={handleResend} disabled={loading || resending}>
            {resending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            <span>{resending ? 'Sending...' : 'Resend Code'}</span>
          </button>
          <div className="auth-footer"><p><Link to="/login" className="auth-link">Back to sign in</Link></p></div>
        </div>
      </div>
    </div>
  );
};