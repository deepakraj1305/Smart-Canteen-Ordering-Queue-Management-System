import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Clock3, Loader2, ReceiptText, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchOrders, formatDate, inr, minutesLeft, timeAgo, updateOrderStatus } from '../lib/api';
import type { Order } from '../lib/types';
import { StudentNavbar } from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import StatusBadge from '../components/StatusBadge';
import { EmptyOrders, ErrorBanner, ListSkeleton } from '../components/Loaders';

function OrderCard({ order, onCancel }: { order: Order; onCancel: (o: Order) => void }) {
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await updateOrderStatus(order.id, 'Cancelled');
      onCancel(order);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not cancel the order.');
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  };

  const isActive = order.status === 'Ordered' || order.status === 'Preparing' || order.status === 'Ready';
  const left = minutesLeft(order);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="font-display grid h-12 min-w-12 place-items-center rounded-xl bg-stone-950 px-2 text-lg font-extrabold text-amber-300">
            {order.token}
          </span>
          <div>
            <p className="text-sm font-bold text-stone-900">
              Order #{order.id} · {order.items.reduce((s, l) => s + l.qty, 0)} items · {inr(order.total)}
            </p>
            <p className="flex items-center gap-1 text-xs text-stone-500">
              <Clock3 className="h-3 w-3" /> {formatDate(order.created_at)} ({timeAgo(order.created_at)})
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="border-t border-stone-100 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {order.items.map((l) => (
            <span key={l.id} className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
              {l.image ? <img src={l.image} alt="" className="h-5 w-5 rounded-md object-cover" /> : null}
              {l.name} × {l.qty}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 bg-stone-50/60 px-5 py-3">
        <div className="text-xs font-semibold text-stone-500">
          {isActive ? (
            order.status === 'Ready' ? (
              <span className="font-bold text-emerald-700">🎉 Ready! Collect it at the counter now.</span>
            ) : (
              <>Est. ready in ~{order.status === 'Ordered' ? order.estimated_minutes : left} min</>
            )
          ) : (
            <>Paid via {order.payment_method}</>
          )}
        </div>
        <div className="flex items-center gap-2">
          {order.status === 'Ordered' && (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
            >
              Cancel order
            </button>
          )}
          <button
            onClick={() => navigate('/track/' + order.id)}
            className="flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-stone-800"
          >
            Track <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {confirming && (
        <div className="border-t border-rose-100 bg-rose-50 px-5 py-3.5">
          <p className="flex items-center gap-2 text-sm font-bold text-rose-800">
            <AlertTriangle className="h-4 w-4" /> Cancel order {order.token}?
          </p>
          <p className="mt-0.5 text-xs text-rose-600">This removes it from the kitchen queue. This cannot be undone.</p>
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-600"
            >
              Keep order
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              Yes, cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'active' | 'past'>('active');

  const load = async (silent = false) => {
    if (!user) return;
    try {
      if (!silent) setLoading(true);
      setError('');
      const data = await fetchOrders({ student_id: user.id, limit: 100 });
      setOrders(data);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const active = orders.filter((o) => o.status === 'Ordered' || o.status === 'Preparing' || o.status === 'Ready');
  const past = orders.filter((o) => o.status === 'Collected' || o.status === 'Cancelled');
  const shown = tab === 'active' ? active : past;

  return (
    <div className="min-h-screen bg-amber-50">
      <StudentNavbar />
      <CartDrawer />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display flex items-center gap-2.5 text-2xl font-extrabold text-stone-950 sm:text-3xl">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                <ReceiptText className="h-5 w-5" />
              </span>
              My Orders
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Live status updates every few seconds — keep this page open while you wait.
            </p>
          </div>
          <Link
            to="/menu"
            className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-110"
          >
            + New order
          </Link>
        </div>

        <div className="mt-5 flex gap-2 rounded-2xl border border-stone-200 bg-white p-1.5">
          {(
            [
              { id: 'active', label: 'Active (' + active.length + ')' },
              { id: 'past', label: 'History (' + past.length + ')' }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                tab === t.id ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} onRetry={() => load()} />
            </div>
          )}
          {loading ? (
            <ListSkeleton count={3} />
          ) : shown.length === 0 ? (
            tab === 'active' ? (
              <EmptyOrders onOrder={() => navigate('/menu')} />
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white/60 px-6 py-14 text-center">
                <p className="font-display text-lg font-bold text-stone-900">No past orders</p>
                <p className="mt-1 text-sm text-stone-500">Collected and cancelled orders will show up here.</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {shown.map((o) => (
                <OrderCard key={o.id} order={o} onCancel={() => load(true)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
