import { useState } from 'react';
import { Eye, EyeOff, Orbit, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../types';

interface AuthPageProps {
  navigate: (page: Page) => void;
}

export default function AuthPage({ navigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) { setError(error); setLoading(false); }
      else navigate('dashboard');
    } else if (mode === 'signup') {
      if (!fullName.trim()) { setError('Please enter your full name'); setLoading(false); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
      const { error } = await signUp(email, password, fullName);
      if (error) { setError(error); }
      else { setSuccess('Account created! Please check your email to verify your account.'); }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <button onClick={() => navigate('home')} className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <Orbit className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-xl text-white">Skill<span className="text-teal-400">Orbit</span></span>
            </button>
            <h1 className="text-2xl font-bold text-white mb-1">
              {mode === 'signin' ? 'Welcome back!' : mode === 'signup' ? 'Create your account' : 'Reset password'}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === 'signin' ? "Don't have an account?" : mode === 'signup' ? 'Already have an account?' : 'Remember your password?'}
              {' '}
              <button
                onClick={() => { setError(''); setSuccess(''); setMode(mode === 'signin' ? 'signup' : 'signin'); }}
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-5 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1.5">
                {[
                  { test: password.length >= 8, label: 'At least 8 characters' },
                  { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
                  { test: /[0-9]/.test(password), label: 'One number' },
                ].map(req => (
                  <div key={req.label} className={`flex items-center gap-2 text-xs ${req.test ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${req.test ? 'opacity-100' : 'opacity-30'}`} />
                    {req.label}
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {mode === 'signup' && (
            <p className="mt-4 text-center text-xs text-slate-500">
              By creating an account, you agree to our{' '}
              <span className="text-teal-400">Terms of Service</span> and{' '}
              <span className="text-teal-400">Privacy Policy</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
