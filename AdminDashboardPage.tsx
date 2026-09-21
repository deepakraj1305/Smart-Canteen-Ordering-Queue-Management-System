import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeIndianRupee, BellRing, ChefHat, ClipboardList, Clock3, PackageCheck, ReceiptText, RefreshCw, TrendingUp, UtensilsCrossed, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchOrders, fetchStats, formatDate, inr, timeAgo } from '../lib/api';
import type { DashboardStats, Order } from '../lib/types';
import { AdminSidebar } from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { ErrorBanner } from '../components/Loaders';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  delay = 0
}: {
  icon: typeof ReceiptText;
  label: string;
  value: string;
  sub: string;
  tone: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur transition hover:bg-white/[0.08]"
    >
      <div className="flex items-center justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-stone-600" />
      </div>
      <p className="font-display mt-4 text-3xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-sm font-bold text-stone-300">{label}</p>
      <p className="text-xs text-stone-500">{sub}</p>
    </motion.div>
  );
}

function BarChart({ stats }: { stats: DashboardStats }) {
  const max = Math.max(1, ...stats.daily.map((d) => d.orders));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display flex items-center gap-2 text-base font-extrabold text-white">
            <TrendingUp className="h-4 w-4 text-orange-400" /> Orders — last 7 days
          </h3>
          <p className="text-xs text-stone-500">Daily order volume including all statuses</p>
        </div>
      </div>
      <div className="mt-5 flex h-44 items-end gap-2 sm:gap-3">
        {stats.daily.map((d, i) => {
          const h = Math.max(6, Math.round((d.orders / max) * 100));
          const isToday = i === stats.daily.length - 1;
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-2" title={d.orders + ' orders · ' + inr(d.revenue)}>
              <span className="text-[11px] font-extrabold text-stone-300">{d.orders}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: h + '%' }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 22 }}
                className={`w-full max-w-12 rounded-t-lg ${isToday ? 'bg-gradient-to-t from-orange-600 to-amber-400' : 'bg-white/15'}`}
              />
              <span className={`text-[11px] font-bold ${isToday ? 'text-amber-300' : 'text-stone-500'}`}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const [s, o] = await Promise.all([fetchStats(), fetchOrders({ limit: 6 })]);
      setStats(s);
      setRecent(o);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 lg:pl-64">
      <AdminSidebar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Canteen Dashboard</h1>
            <p className="mt-1 text-sm text-stone-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} — live kitchen overview
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => load()}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-stone-200 transition hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link
              to="/admin/orders"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110"
            >
              <BellRing className="h-4 w-4" /> Kitchen queue
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} onRetry={() => load()} />
          </div>
        )}

        {loading && !stats ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : stats ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={ReceiptText} label="Total orders" value={String(stats.totalOrders)} sub={stats.todayOrders + ' placed today'} tone="bg-sky-500/15 text-sky-300" delay={0} />
              <StatCard icon={Clock3} label="Pending now" value={String(stats.pendingOrders)} sub={stats.orderedCount + ' new · ' + stats.preparingCount + ' cooking'} tone="bg-amber-500/15 text-amber-300" delay={0.05} />
              <StatCard icon={PackageCheck} label="Completed" value={String(stats.completedOrders)} sub={stats.readyCount + ' ready for pickup'} tone="bg-emerald-500/15 text-emerald-300" delay={0.1} />
              <StatCard icon={BadgeIndianRupee} label="Total revenue" value={inr(stats.revenue)} sub={inr(stats.todayRevenue) + ' earned today'} tone="bg-orange-500/15 text-orange-300" delay={0.15} />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <BarChart stats={stats} />
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <h3 className="font-display flex items-center gap-2 text-base font-extrabold text-white">
                  <UtensilsCrossed className="h-4 w-4 text-orange-400" /> Top selling dishes
                </h3>
                <p className="text-xs text-stone-500">By quantity sold (excluding cancelled)</p>
                <div className="mt-4 space-y-3">
                  {stats.topItems.length === 0 && <p className="text-sm text-stone-500">No sales yet.</p>}
                  {stats.topItems.map((t, i) => {
                    const maxQty = stats.topItems[0]?.qty || 1;
                    return (
                      <div key={t.name}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-stone-200">
                            <span className="mr-2 text-orange-400">#{i + 1}</span>
                            {t.name}
                          </span>
                          <span className="font-extrabold text-white">{t.qty} sold</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: Math.round((t.qty / maxQty) * 100) + '%' }}
                            transition={{ delay: 0.2 + i * 0.08 }}
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-stone-500 uppercase">
                      <Wallet className="h-3 w-3" /> Avg. bill
                    </p>
                    <p className="font-display mt-1 text-xl font-extrabold text-white">{inr(stats.avgOrderValue)}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-stone-500 uppercase">
                      <ChefHat className="h-3 w-3" /> In kitchen
                    </p>
                    <p className="font-display mt-1 text-xl font-extrabold text-white">{stats.pendingOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display flex items-center gap-2 text-base font-extrabold text-white">
                  <ClipboardList className="h-4 w-4 text-orange-400" /> Latest orders
                </h3>
                <Link to="/admin/orders" className="text-xs font-bold text-orange-400 hover:text-orange-300">
                  Open kitchen queue →
                </Link>
              </div>
              <div className="mt-4 space-y-2.5">
                {recent.length === 0 && <p className="text-sm text-stone-500">No orders yet today.</p>}
                {recent.map((o) => (
                  <Link
                    key={o.id}
                    to="/admin/orders"
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.07]"
                  >
                    <span className="font-display rounded-lg bg-white/10 px-2.5 py-1 text-sm font-extrabold text-amber-300">
                      {o.token}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-stone-100">{o.student_name}</span>
                      <span className="block text-xs text-stone-500">
                        {o.items.map((l) => l.name + ' ×' + l.qty).join(', ')} · {formatDate(o.created_at)} ({timeAgo(o.created_at)})
                      </span>
                    </span>
                    <span className="text-sm font-extrabold text-white">{inr(o.total)}</span>
                    <StatusBadge status={o.status} size="sm" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
