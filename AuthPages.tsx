import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { ADMIN_EMAILS } from '../contexts/AuthContext';
import Logo from '../components/Logo';

function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => signInWithGoogle('Smart Food Pickup System')}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z" />
        <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.87 8.87 4.76 12 4.76z" />
      </svg>
      {label}
    </button>
  );
}

function Field({
  icon: Icon,
  error,
  ...props
}: {
  icon: typeof Mail;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div
        className={`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 transition focus-within:ring-2 ${
          error ? 'border-rose-300 focus-within:ring-rose-200' : 'border-stone-200 focus-within:border-orange-400 focus-within:ring-orange-100'
        }`}
      >
        <Icon className="h-4.5 w-4.5 h-5 w-5 shrink-0 text-stone-400" />
        <input {...props} className="w-full bg-transparent py-3 text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400" />
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
  sideTitle,
  sidePoints
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  sideTitle: string;
  sidePoints: string[];
}) {
  return (
    <div className="flex min-h-screen bg-amber-50">
      <div className="hidden w-[45%] flex-col justify-between overflow-hidden bg-stone-950 p-10 text-white lg:flex">
        <Logo light />
        <div className="relative">
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-600/30 blur-3xl" />
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop"
            alt="Canteen food"
            className="relative h-72 w-full rounded-3xl object-cover shadow-2xl"
          />
          <h2 className="font-display relative mt-6 text-3xl font-extrabold">{sideTitle}</h2>
          <ul className="relative mt-4 space-y-2.5">
            {sidePoints.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm font-medium text-stone-300">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-stone-500">Smart Food Pickup System — skip the queue, not the lunch.</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-stone-950">{title}</h1>
          <p className="mt-1.5 text-sm text-stone-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/menu';

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const isAdmin = ADMIN_EMAILS.includes(data.user?.email ?? '');
      navigate(isAdmin ? '/admin' : from, { replace: true });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'student' | 'admin') => {
    setEmail(role === 'admin' ? 'admin@college.edu' : 'student@college.edu');
    setPassword(role === 'admin' ? 'admin123' : 'student123');
  };

  return (
    <AuthShell
      title="Welcome back 👋"
      subtitle="Sign in to order food and track your pickup token."
      sideTitle="Lunch break is short. Queues shouldn't eat into it."
      sidePoints={['Order from your phone in under a minute', 'Get a digital token — no paper slips', 'Collect food the moment it is ready']}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errors.form}
          </div>
        )}
        <Field icon={Mail} type="email" placeholder="College email (you@college.edu)" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <div>
          <div className={`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 transition focus-within:ring-2 ${errors.password ? 'border-rose-300 focus-within:ring-rose-200' : 'border-stone-200 focus-within:border-orange-400 focus-within:ring-orange-100'}`}>
            <Lock className="h-5 w-5 shrink-0 text-stone-400" />
            <input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent py-3 text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400"
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="text-stone-400 hover:text-stone-600" aria-label="Toggle password">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.password}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs font-bold text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> OR <span className="h-px flex-1 bg-stone-200" />
      </div>
      <GoogleButton label="Continue with Google" />

      <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <p className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-orange-800 uppercase">
          <GraduationCap className="h-4 w-4" /> Try a demo account
        </p>
        <div className="mt-2.5 flex gap-2">
          <button onClick={() => fillDemo('student')} className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-orange-100">
            Student demo
          </button>
          <button onClick={() => fillDemo('admin')} className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-orange-100">
            Admin demo
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-stone-500">
        New here?{' '}
        <Link to="/signup" className="font-bold text-orange-700 hover:underline">
          Create a student account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-stone-400">
        Canteen staff?{' '}
        <Link to="/admin/login" className="font-bold text-stone-600 hover:underline">
          Admin login
        </Link>
      </p>
    </AuthShell>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Please enter your full name.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (confirm !== password) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } }
      });
      if (error) throw error;
      navigate('/menu', { replace: true });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Sign-up failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account 🎓"
      subtitle="Join with your college email and order your first meal."
      sideTitle="One account for every craving on campus."
      sidePoints={['Track tokens in real time', 'Full order history', 'Works on any device']}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errors.form}
          </div>
        )}
        <Field icon={User} placeholder="Full name (e.g. Aarav Sharma)" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Field icon={Mail} type="email" placeholder="College email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field icon={Lock} type="password" placeholder="Create password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <Field icon={Lock} type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs font-bold text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> OR <span className="h-px flex-1 bg-stone-200" />
      </div>
      <GoogleButton label="Sign up with Google" />
      <p className="mt-5 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-orange-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      if (!ADMIN_EMAILS.includes(data.user?.email ?? '')) {
        await supabase.auth.signOut();
        throw new Error('This login is only for canteen staff. Students, please use the student login.');
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-10">
      <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-orange-600/20 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo light />
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur">
          <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.25em] text-amber-300 uppercase">
            <ShieldCheck className="h-4 w-4" /> Staff only
          </p>
          <h1 className="font-display mt-2 text-2xl font-extrabold text-white">Canteen Admin Login</h1>
          <p className="mt-1 text-sm text-stone-400">Manage orders, menu and serving tokens.</p>
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
                {error}
              </div>
            )}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 focus-within:border-orange-400">
              <Mail className="h-5 w-5 shrink-0 text-stone-500" />
              <input
                type="email"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-3 text-sm font-medium text-white outline-none placeholder:text-stone-500"
              />
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 focus-within:border-orange-400">
              <Lock className="h-5 w-5 shrink-0 text-stone-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-3 text-sm font-medium text-white outline-none placeholder:text-stone-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in to console
            </button>
          </form>
          <button
            onClick={() => {
              setEmail('admin@college.edu');
              setPassword('admin123');
            }}
            className="mt-4 w-full rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-stone-300 transition hover:bg-white/5"
          >
            Fill demo admin credentials
          </button>
          <p className="mt-5 text-center text-xs text-stone-500">
            <Link to="/" className="font-bold text-stone-300 hover:underline">
              ← Back to student site
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
