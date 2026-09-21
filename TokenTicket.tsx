import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, QrCode, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Order } from '../lib/types';

export default function TokenTicket({ order }: { order: Order }) {
  const itemsCount = order.items.reduce((s, l) => s + l.qty, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="relative overflow-hidden rounded-3xl bg-stone-950 text-white shadow-2xl"
    >
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-orange-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-red-600/25 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 border-b border-dashed border-white/15 px-6 py-8 sm:border-r sm:border-b-0">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-orange-300 uppercase">
            <Ticket className="h-4 w-4" /> Pickup token
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={order.token}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display bg-gradient-to-br from-amber-200 via-orange-400 to-red-500 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent"
            >
              {order.token}
            </motion.p>
          </AnimatePresence>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Order #{order.id} confirmed
          </p>
        </div>

        <div className="flex-1 space-y-3 px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Student</p>
              <p className="mt-0.5 truncate font-bold text-white">{order.student_name}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Items</p>
              <p className="mt-0.5 font-bold text-white">
                {itemsCount} item{itemsCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Ready in</p>
              <p className="mt-0.5 font-bold text-amber-300">~{order.estimated_minutes} min</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Payment</p>
              <p className="mt-0.5 font-bold text-white">{order.payment_method}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={'/track/' + order.id}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-900/40 transition hover:brightness-110"
            >
              Track live status <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-stone-300">
              <QrCode className="h-4 w-4" /> Show at counter
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
