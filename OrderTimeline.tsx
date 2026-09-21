import { motion } from 'framer-motion';
import { BellRing, ChefHat, ClipboardList, PackageCheck, XCircle } from 'lucide-react';
import { STATUS_ORDER } from '../lib/types';
import type { OrderStatus } from '../lib/types';

const STEPS = [
  { key: 'Ordered', label: 'Ordered', icon: ClipboardList },
  { key: 'Preparing', label: 'Preparing', icon: ChefHat },
  { key: 'Ready', label: 'Ready', icon: BellRing },
  { key: 'Collected', label: 'Collected', icon: PackageCheck }
] as const;

export default function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-rose-500 text-white">
          <XCircle className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-sm font-bold text-rose-700">Order Cancelled</p>
          <p className="text-xs text-rose-600">This order was cancelled and removed from the queue.</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="w-full">
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-1 items-start last:flex-none">
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <motion.span
                  initial={false}
                  animate={current ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={current ? { duration: 1.6, repeat: Infinity } : {}}
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-colors sm:h-11 sm:w-11 ${
                    done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : current
                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                        : 'border-stone-200 bg-white text-stone-300'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.span>
                <span
                  className={`text-center text-[10px] font-bold tracking-wide uppercase sm:text-xs ${
                    done ? 'text-emerald-600' : current ? 'text-orange-600' : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-1 mt-5 flex-1 sm:mx-2 sm:mt-[22px]">
                  <div className="h-1 overflow-hidden rounded-full bg-stone-200">
                    <motion.div
                      initial={false}
                      animate={{ width: i < currentIdx ? '100%' : '0%' }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
