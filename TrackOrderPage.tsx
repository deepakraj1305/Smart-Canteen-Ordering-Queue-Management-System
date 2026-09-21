import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BellRing, CheckCircle2, Clock3, Loader2, MapPin, RefreshCw, Ticket, Wallet, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchOrderById, fetchServing, formatDate, inr, minutesLeft, updateOrderStatus } from '../lib/api';
import type { Order, ServingInfo } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { StudentNavbar } from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import OrderTimeline from '../components/OrderTimeline';
import StatusBadge from '../components/StatusBadge';
import PageLoader, { ErrorBanner } from '../components/Loaders';

export default function TrackOrderPage() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [serving, setServing] = useState<ServingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async (silent = false) => {
    if (!id) return;
    try {
      if (!silent) setLoading(true);
      setError('');
      const [o, s] = await Promise.all([fetchOrderById(id), fetchServing().catch(() => null)]);
      setOrder(o);
      if (s) setServing(s);
      setLastUpdated(new Date());
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Could not load this order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 7000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cancel = async () => {
    if (!order || !confirm('Cancel order ' + order.token + '? It will be removed from the kitchen queue.')) return;
    setCancelling(true);
    try {
      const updated = await updateOrderStatus(order.id, 'Cancelled');
      setOrder(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not cancel the order.');
    } finally {
      setCancelling(false);
    }
  };

  const forbidden = order && user && role === 'student' && order.student_id !== user.id;

  return (
    <div className="min-h-screen bg-amber-50">
      <StudentNavbar />
      <CartDrawer />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-stone-500 transition hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {lastUpdated && (
            <button
              onClick={() => load(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-400 transition hover:text-orange-700"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
            </button>
          )}
        </div>

        {loading && !order ? (
          <PageLoader label="Fetching your token..." />
        ) : error ? (
          <div className="mt-6">
            <ErrorBanner message={error} onRetry={() => load()} />
          </div>
        ) : !order ? (
          <p className="mt-10 text-center text-sm text-stone-500">Order not found.</p>
        ) : forbidden ? (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-white p-10 text-center">
            <p className="font-display text-lg font-bold text-stone-900">This token belongs to another student</p>
            <p className="mt-1 text-sm text-stone-500">You can only track your own orders.</p>
            <Link to="/orders" className="mt-4 inline-block rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white">
              Go to my orders
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            {/* Token hero */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-stone-950 p-6 text-center text-white shadow-2xl sm:p-8"
            >
              <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-96 -translate-x-1/2 rounded-full bg-orange-600/30 blur-3xl" />
              <p className="relative flex items-center justify-center gap-2 text-xs font-bold tracking-[0.3em] text-orange-300 uppercase">
                <Ticket className="h-4 w-4" /> Your pickup token
              </p>
              <motion.p
                key={order.token + order.status}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display relative bg-gradient-to-br from-amber-200 via-orange-400 to-red-500 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl"
              >
                {order.token}
              </motion.p>
              <div className="relative mt-2 flex justify-center">
                <StatusBadge status={order.status} size="lg" />
              </div>
              {order.status === 'Ready' ? (
                <p className="relative mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2.5 text-sm font-extrabold text-stone-950">
                  <BellRing className="h-4 w-4" /> Your food is READY — collect it at the counter now!
                </p>
              ) : order.status === 'Ordered' || order.status === 'Preparing' ? (
                <div className="relative mx-auto mt-4 grid max-w-md grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                      <Clock3 className="h-3 w-3" /> Ready in
                    </p>
                    <p className="font-display mt-0.5 text-2xl font-extrabold text-amber-300">
                      ~{order.status === 'Ordered' ? order.estimated_minutes : minutesLeft(order)} min
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Now serving</p>
                    <p className="font-display mt-0.5 text-2xl font-extrabold text-white">{serving?.serving_token ?? '—'}</p>
                  </div>
                </div>
              ) : order.status === 'Collected' ? (
                <p className="relative mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-stone-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Collected — enjoy your meal!
                </p>
              ) : null}
            </motion.div>

            {/* Timeline */}
            <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-extrabold text-stone-900">Live order status</h2>
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Auto-refreshing
                </span>
              </div>
              <OrderTimeline status={order.status} />
            </div>

            {/* Details */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-stone-200 bg-white p-5">
                <h3 className="font-display text-base font-extrabold text-stone-900">Order details</h3>
                <div className="mt-3 space-y-2.5">
                  {order.items.map((l) => (
                    <div key={l.id} className="flex items-center gap-3">
                      {l.image ? (
                        <img src={l.image} alt={l.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-orange-100">🍽️</span>
                      )}
                      <p className="flex-1 truncate text-sm font-semibold text-stone-700">
                        {l.name} <span className="text-stone-400">× {l.qty}</span>
                      </p>
                      <p className="text-sm font-extrabold text-stone-900">{inr(l.price * l.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-stone-200 pt-3">
                  <span className="text-sm font-bold text-stone-500">Total ({order.payment_method})</span>
                  <span className="font-display text-lg font-extrabold text-orange-600">{inr(order.total)}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl border border-stone-200 bg-white p-5 text-sm">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-orange-600" />
                    <p className="font-bold text-stone-900">Pickup: Main Canteen Counter</p>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <Wallet className="h-4 w-4 text-orange-600" />
                    <p className="font-medium text-stone-600">
                      Pay {inr(order.total)} via {order.payment_method} on pickup
                    </p>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <Clock3 className="h-4 w-4 text-orange-600" />
                    <p className="font-medium text-stone-600">Placed {formatDate(order.created_at)}</p>
                  </div>
                </div>
                {order.status === 'Ordered' && (
                  <button
                    onClick={cancel}
                    disabled={cancelling}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-white px-4 py-3 text-sm font-extrabold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    Cancel this order
                  </button>
                )}
                <Link
                  to="/menu"
                  className="block rounded-2xl bg-stone-900 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-stone-800"
                >
                  Order more food
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
