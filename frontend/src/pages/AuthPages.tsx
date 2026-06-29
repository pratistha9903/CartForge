import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, FormField, PasswordStrength } from '../components/auth/AuthLayout';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your cart, saved items, and exclusive tier rewards."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-accent-light hover:text-white">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <FormField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@company.com"
          icon={Mail}
          required
        />

        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          icon={Lock}
          required
          minLength={6}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          }
        />

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept the terms to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join CartForge and start earning tier rewards on every purchase."
      highlights={[
        'Instant access to your personal cart',
        'Automatic tier discounts at checkout',
        'Cross-category savings up to ₹200',
      ]}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-light hover:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <FormField
          id="name"
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="John Smith"
          icon={User}
          required
          minLength={2}
        />

        <FormField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@company.com"
          icon={Mail}
          required
        />

        <div className="space-y-2">
          <FormField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="Minimum 6 characters"
            icon={Lock}
            required
            minLength={6}
            hint="Min. 6 chars"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            }
          />
          <PasswordStrength password={password} />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/5 bg-surface-850/50 p-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-surface-800 text-accent focus:ring-accent/30"
          />
          <span className="text-sm leading-relaxed text-slate-400">
            I agree to the{' '}
            <span className="text-slate-300 underline decoration-white/20">Terms of Service</span> and{' '}
            <span className="text-slate-300 underline decoration-white/20">Privacy Policy</span>
          </span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
