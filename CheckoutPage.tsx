import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, Banknote, CreditCard, Loader2, QrCode, ShieldCheck, Ticket, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { fetchServing, inr, placeOrder } from '../lib/api';
import type { Order, ServingInfo } from '../lib/types';
import { StudentNavbar } from '../components/Navbar';
import TokenTicket from '../components/TokenTicket';

const PAYMENTS = [
  { id: 'UPI', label: 'UPI', hint: 'GPay / PhonePe at counter', icon: QrCode },
  { id: 'Card', label: 'Card', hint: 'Debit / credit at counter', icon: CreditCard },
  { id: 'Cash', label: 'Cash', hint: 'Pay when you collect', icon: Banknote }
];

export default function CheckoutPage() {
  const { user, displayName } = useAuth();
  const { lines, total, clear } = useCart();
  const navigate = useNavigate();

  const [payment, setPayment] = useState('UPI');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<Order | null>(null);
  const [serving, setServing] = useState<ServingInfo | null>(null);

  useEffect(() => {
    fetchServing().then(setServing).catch(() => {});
  }, []);

  const eta = useMemo(() => {
    if (lines.length === 0) return 0;
    const maxPrep = Math.max(...lines.map((l) => l.item.prep_time || 8));
    const qty = lines.reduce((s, l) => s + l.qty, 0);
    return Math.min(45, maxPrep + Math.ceil(qty / 2) + 3);
  }, [lines]);

  const confirm = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (lines.length === 0) return;
    setPlacing(true);
    setError('');
    try {
      const order = await placeOrder({
        student_id: user.id,
        student_name: displayName || 'Student',
        student_email: user.email || '',
        items: lines.map((l) => ({ id: l.item.id, qty: l.qty })),
        payment_method: payment
      });
      setPlaced(order);
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-amber-50">
        <StudentNavbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
              <BadgeCheck className="h-9 w-9" />
            </span>
            <h1 className="font-display mt-4 text-3xl font-extrabold text-stone-950">Order placed! 🎉</h1>
            <p className="mt-1 text-sm text-stone-500">
              Your food is in the kitchen queue. Show this token at the pickup counter.
            </p>
          </motion.div>
          <TokenTicket order={placed} />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/menu"
              className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 shadow-sm transition hover:border-orange-300"
            >
              Back to menu
            </Link>
            <Link
              to="/orders"
              className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              View my orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <StudentNavbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2 text-sm font-bold text-stone-500 transition hover:text-orange-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </button>
        <h1 className="font-display mt-2 text-3xl font-extrabold text-stone-950">Checkout</h1>
        <p className="mt-1 text-sm text-stone-500">Review your tray, pick a payment mode, and grab your token.</p>

        {serving && !serving.is_open && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            The canteen is currently closed. You can still place an order, but preparation will start once it reopens.
          </div>
        )}

        {lines.length === 0 ? (
          <div className="mt-6 rounded-3xl border-2 border-dashed border-orange-200 bg-white/60 px-6 py-16 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-4xl shadow-md">🍱</span>
            <h2 className="font-display mt-4 text-lg font-bold text-stone-900">Your tray is empty</h2>
            <p className="mt-1 text-sm text-stone-500">Add some dishes from the menu before checking out.</p>
            <Link
              to="/menu"
              className="mt-5 inline-block rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/25"
            >
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <p className="border-b border-stone-100 px-5 py-3.5 text-xs font-extrabold tracking-widest text-stone-500 uppercase">
                  Order items ({lines.reduce((s, l) => s + l.qty, 0)})
                </p>
                <div className="divide-y divide-stone-100">
                  {lines.map(({ item, qty }) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-100 text-xl">🍽️</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-500">
                          {inr(item.price)} × {qty}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-stone-900">{inr(item.price * qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-xs font-extrabold tracking-widest text-stone-500 uppercase">Payment method</p>
                <p className="mt-1 text-xs text-stone-400">Pay at the counter when you collect — no prepayment needed.</p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  {PAYMENTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPayment(p.id)}
                      className={`flex flex-col items-start gap-1 rounded-2xl border-2 p-3.5 text-left transition ${
                        payment === p.id
                          ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <p.icon className={`h-5 w-5 ${payment === p.id ? 'text-orange-600' : 'text-stone-400'}`} />
                      <span className="text-sm font-extrabold text-stone-900">{p.label}</span>
                      <span className="text-[11px] font-medium text-stone-500">{p.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-fit space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-xs font-extrabold tracking-widest text-stone-500 uppercase">Bill summary</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="font-bold text-stone-900">{inr(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Packaging</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Est. preparation</span>
                    <span className="font-bold text-stone-900">~{eta} min</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-stone-200 pt-3">
                    <span className="font-display font-extrabold text-stone-900">To pay</span>
                    <span className="font-display text-xl font-extrabold text-orange-600">{inr(total)}</span>
                  </div>
                </div>
                {error && (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                    {error}
                  </div>
                )}
                <button
                  onClick={confirm}
                  disabled={placing}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-600/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Placing order...
                    </>
                  ) : (
                    <>
                      <Ticket className="h-4 w-4" /> Place order & get token
                    </>
                  )}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-stone-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Free cancellation before preparation starts
                </p>
              </div>

              <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <Wallet className="h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-xs leading-relaxed font-medium text-emerald-800">
                  Pay <span className="font-extrabold">{inr(total)}</span> via {payment} at the pickup counter. Keep
                  your digital token ready — tokens are called in order.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
