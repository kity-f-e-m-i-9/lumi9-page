import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import './AuthModal.css';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function GoogleButton() {
  return (
    <a className="auth-google-btn" href="/google">
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.3 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4 5.7l6.6 5.6C41.9 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
      </svg>
      Continue with Google
    </a>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="auth-field-error">{message}</p>;
}

function RegisterForm({ onOtpSent }) {
  const [form, setForm] = useState({ username: '', mobile: '', email: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: null }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await apiFetch('/api/whatsapp-check', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      toast.success('OTP sent to your WhatsApp.');
      onOtpSent({ mobile: form.mobile, name: form.username, endpoint: '/api/whatsapp-check', payload: form });
    } catch (err) {
      if (err.errors) {
        const flat = {};
        Object.entries(err.errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(flat);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <label className="auth-field">
        <span>Full name</span>
        <input
          type="text"
          autoComplete="name"
          value={form.username}
          onChange={update('username')}
          placeholder="Your name"
          required
        />
        <FieldError message={errors.username} />
      </label>

      <label className="auth-field">
        <span>WhatsApp number</span>
        <div className="auth-phone-input">
          <span className="auth-phone-prefix">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={form.mobile}
            onChange={(e) => update('mobile')({ target: { value: e.target.value.replace(/\D/g, '') } })}
            placeholder="10-digit mobile number"
            required
          />
        </div>
        <FieldError message={errors.mobile} />
      </label>

      <label className="auth-field">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          placeholder="you@example.com"
          required
        />
        <FieldError message={errors.email} />
      </label>

      <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
        {loading ? 'Sending OTP…' : 'Send OTP'}
      </button>
    </form>
  );
}

function LoginForm({ onOtpSent }) {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/api/whatsapp-login-check', {
        method: 'POST',
        body: JSON.stringify({ mobile }),
      });
      toast.success('OTP sent to your WhatsApp.');
      onOtpSent({ mobile, endpoint: '/api/whatsapp-login-check', payload: { mobile } });
    } catch (err) {
      if (err.errors?.mobile) {
        setError(Array.isArray(err.errors.mobile) ? err.errors.mobile[0] : err.errors.mobile);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <label className="auth-field">
        <span>WhatsApp number</span>
        <div className="auth-phone-input">
          <span className="auth-phone-prefix">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value.replace(/\D/g, ''));
              setError(null);
            }}
            placeholder="10-digit mobile number"
            required
          />
        </div>
        <FieldError message={error} />
      </label>

      <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
        {loading ? 'Sending OTP…' : 'Send OTP'}
      </button>
    </form>
  );
}

function OtpForm({ context, onBack, onVerified }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);
  const toast = useToast();

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft]);

  const setDigit = (index, value) => {
    const v = value.replace(/\D/g, '').slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[index] = v;
      return next;
    });
    setError(null);
    if (v && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    setDigits((d) => {
      const next = [...d];
      text.split('').forEach((ch, i) => {
        next[i] = ch;
      });
      return next;
    });
    inputsRef.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const otp = digits.join('');

  const verify = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setError('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile: context.mobile, otp }),
      });
      onVerified(data.user);
    } catch (err) {
      if (err.errors?.otp) {
        setError(Array.isArray(err.errors.otp) ? err.errors.otp[0] : err.errors.otp);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await apiFetch(context.endpoint, {
        method: 'POST',
        body: JSON.stringify(context.payload),
      });
      toast.success('A new OTP has been sent.');
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={verify} noValidate>
      <button type="button" className="auth-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <p className="auth-otp-hint">
        Enter the 6-digit code sent to <strong>+91 {context.mobile}</strong>
      </p>

      <div className="auth-otp-inputs" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={handleKeyDown(i)}
            className="auth-otp-box"
            aria-label={`Digit ${i + 1} of 6`}
          />
        ))}
      </div>
      <FieldError message={error} />

      <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
        {loading ? 'Verifying…' : 'Verify & Continue'}
      </button>

      <button
        type="button"
        className="auth-resend-btn"
        onClick={resend}
        disabled={resending || secondsLeft > 0}
      >
        {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : resending ? 'Resending…' : 'Resend OTP'}
      </button>
    </form>
  );
}

export default function AuthModal() {
  const { modalMode, closeModal, setUser } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otpContext, setOtpContext] = useState(null);
  const open = modalMode === 'login' || modalMode === 'register';

  useEffect(() => {
    if (!open) {
      setStep('form');
      setOtpContext(null);
      return undefined;
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, closeModal]);

  if (!open) return null;

  const isLogin = modalMode === 'login';

  const handleOtpSent = (ctx) => {
    setOtpContext(ctx);
    setStep('otp');
  };

  const handleVerified = (user) => {
    setUser(user);
    closeModal();
    toast.success(isLogin ? `Welcome back, ${user.name}!` : `Welcome to Lumi9, ${user.name}!`);
  };

  return (
    <>
      <div className="auth-overlay is-open" onClick={closeModal} aria-hidden="true" />
      <div className="auth-modal-wrap">
        <div className="auth-modal" role="dialog" aria-modal="true" aria-label={isLogin ? 'Log in' : 'Create account'}>
          <button type="button" className="auth-modal-close" aria-label="Close" onClick={closeModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="auth-modal-header">
            <span className="auth-modal-logo-wrap">
              <img src="/images/logo.webp" alt="Lumi9" className="auth-modal-logo" width="64" height="24" />
            </span>
            <h2 className="auth-modal-title">
              {step === 'otp' ? 'Verify your number' : isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="auth-modal-subtitle">
              {step === 'otp'
                ? "We've sent a one-time code to verify it's you."
                : isLogin
                  ? 'Log in with your WhatsApp number.'
                  : 'Join Lumi9 for a gentler diapering journey.'}
            </p>
          </div>

          <div className="auth-modal-body">
            {step === 'form' && (
              <>
                <GoogleButton />
                <div className="auth-divider"><span>or continue with WhatsApp</span></div>
                {isLogin ? <LoginForm onOtpSent={handleOtpSent} /> : <RegisterForm onOtpSent={handleOtpSent} />}
              </>
            )}

            {step === 'otp' && otpContext && (
              <OtpForm context={otpContext} onBack={() => setStep('form')} onVerified={handleVerified} />
            )}
          </div>

          {step === 'form' && (
            <div className="auth-modal-footer">
              {isLogin ? (
                <p>New to Lumi9? <SwitchLink mode="register" /></p>
              ) : (
                <p>Already have an account? <SwitchLink mode="login" /></p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SwitchLink({ mode }) {
  const { openLogin, openRegister } = useAuth();
  return (
    <button
      type="button"
      className="auth-switch-link"
      onClick={mode === 'login' ? openLogin : openRegister}
    >
      {mode === 'login' ? 'Log in' : 'Register'}
    </button>
  );
}
