import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login, verifyOtp, sendOtp } from '../api/client';

// ── Shared input style ────────────────────────────────────────
const inputCls =
  'w-full bg-bg border border-border rounded px-3 py-2.5 text-text text-sm font-mono ' +
  'focus:outline-none focus:border-accent transition-colors placeholder-muted';

export default function LoginPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  // step: 'credentials' | 'otp'
  const [step,    setStep]    = useState('credentials');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [otp,     setOtp]     = useState('');
  const [error,   setError]   = useState('');
  const [info,    setInfo]     = useState('');
  const [loading, setLoading] = useState(false);

  // ── Step 1: submit credentials ────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      setInfo(res.data.message); // "Check your email for the login code"
      setStep('otp');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || 'Login failed.');
      // If account unverified — switch to register OTP flow
      if (data?.needsVerification) {
        setStep('otp');
        setInfo('A verification code was sent to your email. Enter it to activate your account.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp, purpose: 'login' });
      loginWithToken(res.data.token, res.data.user);
      navigate('/welcome');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────
  const handleResend = async () => {
    setError(''); setInfo('');
    try {
      await sendOtp({ email, purpose: 'login' });
      setInfo('A new code has been sent to your email.');
    } catch {
      setError('Failed to resend. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#00ff88 1px,transparent 1px),linear-gradient(90deg,#00ff88 1px,transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle,#00ff88,transparent 70%)' }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-accent/40 mb-4"
            style={{ background: 'radial-gradient(circle at center,#00ff8815,transparent)' }}>
            <span className="font-display text-accent text-xl font-black">RT</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-accent tracking-widest" style={{ textShadow: '0 0 8px #00ff88' }}>
            REDTEAM
          </h1>
          <p className="text-textDim text-xs font-mono mt-1 tracking-wider">
            SIMULATION PLATFORM // SECURE ACCESS
          </p>
        </div>

        <div className="card p-6" style={{ background: '#0d1117' }}>

          {/* ── Step indicator ── */}
          <div className="flex items-center gap-2 mb-5">
            {['credentials', 'otp'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step === s ? 'bg-accent text-bg' : i < ['credentials','otp'].indexOf(step) ? 'bg-accent/40 text-accent' : 'bg-border text-textDim'
                }`}>
                  {i + 1}
                </div>
                {i === 0 && <div className={`flex-1 h-px w-8 ${step === 'otp' ? 'bg-accent/40' : 'bg-border'}`} />}
              </div>
            ))}
            <span className="text-textDim text-[10px] font-mono ml-1">
              {step === 'credentials' ? 'Enter Credentials' : 'Verify Code'}
            </span>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="bg-red/10 border border-red/30 rounded p-3 text-red text-xs font-mono mb-4">⚠ {error}</div>
          )}
          {info && (
            <div className="bg-accent/10 border border-accent/30 rounded p-3 text-accent text-xs font-mono mb-4">✓ {info}</div>
          )}

          {/* ── Step 1: Credentials ── */}
          {step === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-textDim text-xs font-mono uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-textDim text-xs font-mono uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded font-display text-sm font-bold tracking-widest text-bg transition-all disabled:opacity-50"
                style={{ background: '#00ff88' }}
              >
                {loading ? 'VERIFYING...' : 'CONTINUE →'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-textDim text-xs font-mono uppercase tracking-wider mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`${inputCls} text-center text-2xl tracking-[0.4em]`}
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
                <div className="text-textDim text-[10px] font-mono mt-1.5 text-center">
                  Code sent to <span className="text-accent">{email}</span> · Expires in 5 minutes
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-2.5 rounded font-display text-sm font-bold tracking-widest text-bg transition-all disabled:opacity-50"
                style={{ background: '#00ff88' }}
              >
                {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => { setStep('credentials'); setError(''); setOtp(''); }}
                  className="text-textDim text-xs font-mono hover:text-text transition-colors">
                  ← Back
                </button>
                <button type="button" onClick={handleResend}
                  className="text-accent text-xs font-mono hover:underline transition-colors">
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* Register link */}
          {step === 'credentials' && (
            <div className="mt-5 pt-4 border-t border-border text-center">
              <span className="text-textDim text-xs font-mono">No account? </span>
              <Link to="/register" className="text-accent text-xs font-mono hover:underline">
                Register here
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-textDim text-[10px] font-mono mt-4">
          SIMULATION ONLY — NO REAL EXPLOITS
        </p>
      </div>
    </div>
  );
}