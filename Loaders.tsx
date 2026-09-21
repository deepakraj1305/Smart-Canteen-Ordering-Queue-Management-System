import { motion } from 'framer-motion';
import { CookingPot, ReceiptText, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import type { ReactNode } from 'react';

/* ---------- Full page loader ---------- */
export function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl shadow-orange-500/30"
      >
        <CookingPot className="h-8 w-8" />
      </motion.div>
      <p className="font-display text-sm font-semibold text-stone-500">{label}</p>
    </div>
  );
}

/* ---------- Skeleton cards for menu grid ---------- */
export function MenuSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="h-44 bg-stone-200" />
          <div className="space-y-2.5 p-4">
            <div className="h-4 w-3/4 rounded bg-stone-200" />
            <div className="h-3 w-full rounded bg-stone-100" />
            <div className="h-3 w-2/3 rounded bg-stone-100" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 w-16 rounded bg-stone-200" />
              <div className="h-9 w-24 rounded-xl bg-stone-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Skeleton rows for order lists ---------- */
export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
          <div className="h-12 w-12 rounded-xl bg-stone-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-stone-200" />
            <div className="h-3 w-2/3 rounded bg-stone-100" />
          </div>
          <div className="h-8 w-20 rounded-full bg-stone-200" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Generic empty state ---------- */
export function EmptyState({
  icon,
  title,
  subtitle,
  action
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/60 px-6 py-14 text-center"
    >
      <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white text-orange-500 shadow-md">{icon}</span>
      <h3 className="font-display text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{subtitle}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export function EmptyMenu({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={<UtensilsCrossed className="h-8 w-8" />}
      title="No dishes found"
      subtitle="Try a different search term or category — the chef is still cooking up the full menu."
      action={
        onReset ? (
          <button
            onClick={onReset}
            className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:bg-orange-700"
          >
            Clear filters
          </button>
        ) : undefined
      }
    />
  );
}

export function EmptyOrders({ onOrder }: { onOrder?: () => void }) {
  return (
    <EmptyState
      icon={<ShoppingBag className="h-8 w-8" />}
      title="No orders yet"
      subtitle="Hungry? Browse the canteen menu and place your first order — your pickup token will appear here."
      action={
        onOrder ? (
          <button
            onClick={onOrder}
            className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:bg-orange-700"
          >
            Browse menu
          </button>
        ) : undefined
      }
    />
  );
}

export function EmptyQueue() {
  return (
    <EmptyState
      icon={<ReceiptText className="h-8 w-8" />}
      title="Kitchen queue is clear"
      subtitle="No orders in this lane right now. New student orders will appear here in real time."
    />
  );
}

/* ---------- Inline error banner ---------- */
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <span className="font-medium">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default PageLoader;
