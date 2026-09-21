import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, BellRing, Clock3, QrCode, Sparkles, Ticket, TrendingUp, Users, UtensilsCrossed, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMenu } from '../lib/api';
import type { MenuItem } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import ServingBoard from '../components/ServingBoard';
import FoodCard from '../components/FoodCard';

const STEPS = [
  { icon: UtensilsCrossed, title: '1. Order online', text: 'Browse the live canteen menu and pay at the counter.' },
  { icon: Ticket, title: '2. Get your token', text: 'Instant digital pickup token — no paper slips, no shouting.' },
  { icon: BellRing, title: '3. Collect when ready', text: 'Watch the live counter and walk up only when served.' }
];

const PERKS = [
  { icon: Clock3, title: 'Zero queue time', text: 'Order between lectures and skip the 20-minute lunch line.' },
  { icon: QrCode, title: 'Digital tokens', text: 'Unique daily tokens keep pickup fast, fair and organized.' },
  { icon: TrendingUp, title: 'Live kitchen status', text: 'Real-time Ordered → Preparing → Ready tracking.' },
  { icon: Wallet, title: 'Student pricing', text: 'Canteen rates with UPI, card or cash at pickup.' }
];

export default function LandingPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const preview = useMemo(() => menu.filter((m) => m.available).slice(0, 4), [menu]);

  useEffect(() => {
    fetchMenu().then(setMenu).catch(() => {});
  }, []);

  const primaryTarget = user ? (role === 'admin' ? '/admin' : '/menu') : '/signup';

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-stone-600 md:flex">
            <a href="#how" className="transition hover:text-orange-600">How it works</a>
            <a href="#menu" className="transition hover:text-orange-600">Menu</a>
            <a href="#live" className="transition hover:text-orange-600">Live counter</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={() => navigate(role === 'admin' ? '/admin' : '/menu')}
                className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800"
              >
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-100">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-110"
                >
                  Order food
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pattern-dots relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-xs font-bold text-orange-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Built for campus life — skip the lunch queue
            </span>
            <h1 className="font-display mt-5 text-4xl leading-[1.08] font-extrabold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Order canteen food in seconds.{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Collect with a token.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
              Browse the live menu, pay at the counter, and get a digital pickup token. Watch your order go from{' '}
              <span className="font-bold text-stone-800">Ordered → Preparing → Ready</span> — then walk up only when
              your food is hot.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(primaryTarget)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-orange-600/30 transition hover:brightness-110 active:scale-95"
              >
                Start ordering <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#live"
                className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-6 py-3.5 text-sm font-bold text-stone-800 shadow-sm transition hover:border-orange-300 hover:text-orange-700"
              >
                <BellRing className="h-4 w-4" /> View live counter
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <span className="flex items-center gap-2 font-semibold text-stone-600">
                <Users className="h-4 w-4 text-orange-600" /> 2,400+ students served
              </span>
              <span className="flex items-center gap-2 font-semibold text-stone-600">
                <BadgeCheck className="h-4 w-4 text-emerald-600" /> Avg. pickup in 12 min
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="animate-float-soft relative mx-auto max-w-md overflow-hidden rounded-[2rem] border-8 border-stone-950 bg-stone-950 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop"
                alt="Delicious canteen thali"
                className="h-72 w-full object-cover sm:h-80"
              />
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between rounded-2xl bg-white/[0.07] p-3">
                  <div>
                    <p className="text-[11px] font-bold tracking-widest text-orange-300 uppercase">Now serving</p>
                    <p className="font-display text-4xl font-extrabold text-white">C104</p>
                  </div>
                  <span className="rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-extrabold text-stone-950">
                    READY
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {['Ordered', 'Preparing', 'Ready'].map((s, i) => (
                    <div key={s} className="flex flex-1 items-center gap-2">
                      <div className={`h-1.5 flex-1 rounded-full ${i < 3 ? 'bg-emerald-400' : 'bg-white/15'}`} />
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs font-semibold text-stone-400">Live demo preview of the pickup ticket</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-xl sm:block">
              <p className="text-xs font-bold text-stone-500">Masala Dosa</p>
              <p className="font-display text-lg font-extrabold text-stone-900">₹60 · ⭐ 4.8</p>
            </div>
            <div className="absolute -top-4 -right-2 hidden rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-xl sm:block">
              <p className="text-xs font-bold text-stone-500">Queue position</p>
              <p className="font-display text-lg font-extrabold text-emerald-600">#2 · ~6 min</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-extrabold tracking-[0.25em] text-orange-600 uppercase">How it works</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold text-stone-950 sm:text-4xl">
            Lunch break, minus the line
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-lg hover:shadow-orange-500/10"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-4 text-lg font-bold text-stone-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-500">{s.text}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p) => (
            <div key={p.title} className="flex gap-3 rounded-2xl border border-stone-200 bg-white/70 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700">
                <p.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">{p.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live counter */}
      <section id="live" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <ServingBoard />
      </section>

      {/* Menu preview */}
      <section id="menu" className="border-t border-orange-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold tracking-[0.25em] text-orange-600 uppercase">Today's menu</p>
              <h2 className="font-display mt-2 text-3xl font-extrabold text-stone-950">Fresh from the canteen</h2>
            </div>
            <Link to={user ? '/menu' : '/signup'} className="flex items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-800">
              View full menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {preview.map((item, i) => (
              <FoodCard key={item.id} item={item} index={i} />
            ))}
            {preview.length === 0 && (
              <p className="col-span-full rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-sm text-stone-500">
                Menu is loading — check back in a moment.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 p-8 text-center text-white shadow-2xl sm:p-12">
          <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Hungry? Your token is one tap away.</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-orange-100 sm:text-base">
            Join with your college email, order in under a minute, and get notified the moment your food is ready.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(primaryTarget)}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-orange-700 shadow-lg transition hover:bg-orange-50"
            >
              Get started free
            </button>
            <Link
              to="/admin/login"
              className="rounded-2xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Canteen staff login
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-orange-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-center text-xs text-stone-500">
            Smart Food Pickup System — a Web Technology college project. Order online, skip the queue.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-stone-500">
            <Link to="/menu" className="hover:text-orange-600">Menu</Link>
            <Link to="/serving" className="hover:text-orange-600">Live counter</Link>
            <Link to="/admin/login" className="hover:text-orange-600">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
