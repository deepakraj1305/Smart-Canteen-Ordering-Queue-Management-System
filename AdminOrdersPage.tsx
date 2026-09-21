import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCheck, ChefHat, ClipboardList, Flame, Loader2, Megaphone, PackageCheck, Radio, RefreshCw, Search, Store, Trash2 } from 'lucide-react';
import { deleteOrder, fetchOrders, fetchServing, formatDate, inr, timeAgo, updateOrderStatus, updateServing } from '../lib/api';
import type { Order, OrderStatus, ServingInfo } from '../lib/types';
import { AdminSidebar } from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { EmptyQueue, ErrorBanner, ListSkeleton } from '../components/Loaders';

const NEXT: Record<string, { to: OrderStatus; label: string; icon: typeof Flame }> = {
  Ordered: { to: 'Preparing', label: 'Start preparing', icon: ChefHat },
  Preparing: { to: 'Ready', label: 'Mark ready', icon: PackageCheck },
  Ready: { to: 'Collected', label: 'Mark collected', icon: CheckCheck }
};

function OrderTicket({ order, onChange, onDelete }: { order: Order; onChange: () => void; onDelete: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const advance = async (to: OrderStatus) => {
    setBusy(true);
    setError('');
    try {
      await updateOrderStatus(order.id, to);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Status update failed.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete order ' + order.token + ' permanently?')) return;
    setBusy(true);
    try {
      await deleteOrder(order.id);
      onDelete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
      setBusy(false);
    }
  };

  const next = NEXT[order.status];
  const NextIcon = next?.icon ?? ArrowRight;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="font-display rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 px-2.5 py-1 text-base font-extrabold text-stone-950">
            {order.token}
          </span>
          <div>
            <p className="text-sm font-bold text-white">{order.student_name}</p>
            <p className="text-[11px] text-stone-400">
              #{order.id} · {timeAgo(order.created_at)} · {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>
      <div className="space-y-1.5 px-4 py-3">
        {order.items.map((l) => (
          <div key={l.id} className="flex items-center gap-2.5 text-sm">
            {l.image ? (
              <img src={l.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">🍽️</span>
            )}
            <span className="flex-1 truncate font-semibold text-stone-200">{l.name}</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-extrabold text-amber-300">×{l.qty}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-xs">
        <span className="font-semibold text-stone-400">
          {inr(order.total)} · {order.payment_method} · ETA {order.estimated_minutes}m
        </span>
      </div>
      {error && <p className="border-t border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300">{error}</p>}
      <div className="flex gap-2 border-t border-white/10 p-3">
        {next ? (
          <button
            onClick={() => advance(next.to)}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <NextIcon className="h-3.5 w-3.5" />}
            {next.label}
          </button>
        ) : (
          <span className="flex flex-1 items-center justify-center rounded-xl bg-white/5 px-3 py-2.5 text-xs font-bold text-stone-400">
            {order.status === 'Collected' ? 'Picked up ✓' : 'Cancelled'}
          </span>
        )}
        {(order.status === 'Ordered' || order.status === 'Preparing') && (
          <button
            onClick={() => advance('Cancelled')}
            disabled={busy}
            className="rounded-xl border border-rose-500/30 px-3 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        {(order.status === 'Collected' || order.status === 'Cancelled') && (
          <button
            onClick={remove}
            disabled={busy}
            className="grid w-11 place-items-center rounded-xl border border-white/10 text-stone-500 transition hover:border-rose-500/40 hover:text-rose-300"
            aria-label="Delete order"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

const TABS = ['All', 'Ordered', 'Preparing', 'Ready', 'Collected', 'Cancelled'] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [search, setSearch] = useState('');
  const [serving, setServing] = useState<ServingInfo | null>(null);

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const [o, s] = await Promise.all([fetchOrders({ today: true, limit: 300 }), fetchServing().catch(() => null)]);
      setOrders(o);
      if (s) setServing(s);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    for (const t of TABS.slice(1)) c[t] = orders.filter((o) => o.status === t).length;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    let rows = tab === 'All' ? orders : orders.filter((o) => o.status === tab);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      rows = rows.filter(
        (o) =>
          o.token.toLowerCase().includes(s) ||
          o.student_name.toLowerCase().includes(s) ||
          o.items.some((l) => l.name.toLowerCase().includes(s))
      );
    }
    const rank: Record<string, number> = { Ordered: 0, Preparing: 1, Ready: 2, Collected: 3, Cancelled: 4 };
    return [...rows].sort((a, b) => rank[a.status] - rank[b.status] || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [orders, tab, search]);

  const advanceServing = async () => {
    const firstReady = orders.find((o) => o.status === 'Ready');
    const current = serving?.serving_token || 'C101';
    const num = parseInt(current.replace(/\D/g, ''), 10);
    const nextToken = firstReady ? firstReady.token : 'C' + (isNaN(num) ? 101 : num + 1);
    try {
      const updated = await updateServing({ serving_token: nextToken });
      setServing(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not update serving token.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 lg:pl-64">
      <AdminSidebar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display flex items-center gap-2.5 text-2xl font-extrabold text-white sm:text-3xl">
              <ClipboardList className="h-7 w-7 text-orange-400" /> Live Kitchen Queue
              <span className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-extrabold tracking-widest text-rose-300 uppercase">
                <Radio className="h-3 w-3 animate-pulse" /> Live
              </span>
            </h1>
            <p className="mt-1 text-sm text-stone-400">Today's orders — tap a ticket to move it through the kitchen.</p>
          </div>
          <button
            onClick={() => load()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-stone-200 transition hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Serving strip */}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
            <Megaphone className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold tracking-widest text-amber-300/80 uppercase">Now serving on display</p>
            <p className="font-display text-2xl font-extrabold text-white">{serving?.serving_token ?? '—'}</p>
          </div>
          <button
            onClick={advanceServing}
            className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-stone-950 shadow-lg transition hover:brightness-110"
          >
            Advance token <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                  tab === t ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'border border-white/10 bg-white/5 text-stone-300 hover:bg-white/10'
                }`}
              >
                {t}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === t ? 'bg-white/20' : 'bg-white/10'}`}>{counts[t] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 lg:ml-auto lg:w-72">
            <Search className="h-4 w-4 shrink-0 text-stone-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search token, student, dish..."
              className="w-full bg-transparent py-2.5 text-sm font-medium text-white outline-none placeholder:text-stone-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} onRetry={() => load()} />
          </div>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <ListSkeleton count={4} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <EmptyQueue />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((o) => (
                  <OrderTicket key={o.id} order={o} onChange={() => load(true)} onDelete={() => load(true)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-stone-500">
          <Store className="h-3.5 w-3.5" /> Tip: mark an order Ready and the student's token lights up green on the
          pickup display. Collected orders count toward today's revenue.
        </p>
      </main>
    </div>
  );
}
