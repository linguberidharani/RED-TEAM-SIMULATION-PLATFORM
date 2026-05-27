import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register, verifyOtp, sendOtp } from '../api/client';

const inputCls =
  'w-full bg-bg border border-border rounded px-3 py-2.5 text-text text-sm font-mono ' +
  'focus:outline-none focus:border-accent transition-colors placeholder-muted';

// Password strength calculator
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–5
}

const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['', '#ff3b3b', '#ff7800', '#ffd60a', '#00cc6a', '#00ff88'];

export default function RegisterPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  const [step,     setStep]     = useState('form'); // 'form' | 'otp'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [otp,      setOtp]      = useState('');
  const [error,    setError]    = useState('');
  const [info,     setInfo]     = useState('');
  const [loading,  setLoading]  = useState(false);

  const strength = getStrength(password);
  const passwordsMatch = password && confirm && password === confirm;

  // ── Step 1: register ─────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await register({ email, password, confirmPassword: confirm, name });
      setInfo(res.data.message);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ──────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp, purpose: 'register' });
      loginWithToken(res.data.token, res.data.user);
      navigate('/welcome');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(''); setInfo('');
    try {
      await sendOtp({ email, purpose: 'register' });
      setInfo('A new code has been sent.');
    } catch {
      setError('Failed to resend.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
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
            CREATE ACCOUNT
          </h1>
          <p className="text-textDim text-xs font-mono mt-1 tracking-wider">
            REDTEAM SIMULATION PLATFORM
          </p>
        </div>

        <div className="card p-6" style={{ background: '#0d1117' }}>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-5">
            {['form', 'otp'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step === s ? 'bg-accent text-bg' : i < ['form','otp'].indexOf(step) ? 'bg-accent/40 text-accent' : 'bg-border text-textDim'
                }`}>
                  {i + 1}
                </div>
                {i === 0 && <div className={`flex-1 h-px w-8 ${step === 'otp' ? 'bg-accent/40' : 'bg-border'}`} />}
              </div>
            ))}
            <span className="text-textDim text-[10px] font-mono ml-1">
              {step === 'form' ? 'Account Details' : 'Verify Email'}
            </span>
          </div>

          {error && <div className="bg-red/10 border border-red/30 rounded p-3 text-red text-xs font-mono mb-4">⚠ {error}</div>}
          {info  && <div className="bg-accent/10 border border-accent/30 rounded p-3 text-accent text-xs font-mono mb-4">✓ {info}</div>}

          {/* ── Step 1: Registration form ── */}
          {step === 'form' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-textDim text-xs font-mono uppercase tracking-wider mb-1.5">
                  Display Name <span className="text-muted normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-textDim text-xs font-mono uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-textDim text-xs font-mono uppercase tracking-wider mb-1.5">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Min 6 characters"
                  required
                />
                {/* Strength bar */}
                {password && (
                  <div className="mt-1.5">
                    <div className="flex gap-0.5 h-1 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? STRENGTH_COLORS[strength] : '#1e2d3d' }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: STRENGTH_COLORS[strength] }}>
                      {STRENGTH_LABELS[strength]}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-textDim text-xs font-mono uppercase tracking-wider mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={`${inputCls} ${confirm && !passwordsMatch ? 'border-red/50' : confirm && passwordsMatch ? 'border-accent/50' : ''}`}
                  placeholder="Repeat password"
                  required
                />
                {confirm && (
                  <div className={`text-[10px] font-mono mt-1 ${passwordsMatch ? 'text-accent' : 'text-red'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !passwordsMatch}
                className="w-full py-2.5 rounded font-display text-sm font-bold tracking-widest text-bg transition-all disabled:opacity-50"
                style={{ background: '#00ff88' }}
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-textDim text-xs font-mono uppercase tracking-wider mb-1.5">
                  Verification Code
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
                {loading ? 'VERIFYING...' : 'VERIFY EMAIL ✓'}
              </button>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => { setStep('form'); setError(''); setOtp(''); }}
                  className="text-textDim text-xs font-mono hover:text-text transition-colors">
                  ← Back
                </button>
                <button type="button" onClick={handleResend}
                  className="text-accent text-xs font-mono hover:underline">
                  Resend code
                </button>
              </div>
            </form>
          )}

          {step === 'form' && (
            <div className="mt-5 pt-4 border-t border-border text-center">
              <span className="text-textDim text-xs font-mono">Already have an account? </span>
              <Link to="/login" className="text-accent text-xs font-mono hover:underline">Sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
