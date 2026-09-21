import { motion } from 'framer-motion';
import { BellRing, ChefHat, Megaphone, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServing } from '../lib/api';
import type { ServingInfo } from '../lib/types';

export function useServing(pollMs = 10000) {
  const [serving, setServing] = useState<ServingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchServing();
      setServing(data);
    } catch (e) {
      console.error('Serving fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), pollMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs]);

  return { serving, loading, reload: () => load(true) };
}

export default function ServingBoard({ compact = false }: { compact?: boolean }) {
  const { serving, loading } = useServing();

  if (loading && !serving) {
    return (
      <div className="animate-pulse rounded-3xl bg-stone-950 p-6 sm:p-8">
        <div className="mx-auto h-8 w-48 rounded bg-white/10" />
        <div className="mx-auto mt-4 h-20 w-64 rounded-2xl bg-white/10" />
      </div>
    );
  }

  if (!serving) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-stone-950 p-6 text-white shadow-2xl sm:p-8">
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />

      {serving.announcement && (
        <div className="relative mb-5 flex items-center gap-2.5 overflow-hidden rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-2.5">
          <Megaphone className="h-4 w-4 shrink-0 text-amber-300" />
          <div className="relative flex-1 overflow-hidden">
            <p className="animate-marquee inline-block text-sm font-semibold whitespace-nowrap text-amber-200">
              {serving.announcement} &nbsp;&nbsp;•&nbsp;&nbsp; {serving.announcement}
            </p>
          </div>
        </div>
      )}

      <div className={`relative grid gap-6 ${compact ? 'md:grid-cols-2' : 'lg:grid-cols-[1fr_1.1fr]'}`}>
        <div className="text-center md:text-left">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.25em] text-orange-300 uppercase md:justify-start">
            <Store className="h-4 w-4" />
            {serving.is_open ? 'Canteen open — now serving' : 'Canteen currently closed'}
          </p>
          <motion.p
            key={serving.serving_token}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="font-display mt-2 bg-gradient-to-br from-amber-200 via-orange-400 to-red-500 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl"
          >
            {serving.serving_token}
          </motion.p>
          <p className="mt-2 text-sm text-stone-400">
            Show this token at the pickup counter to collect your food.
          </p>
          {!compact && (
            <Link
              to="/menu"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-900/40 transition hover:brightness-110"
            >
              Order now, skip the queue
            </Link>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4">
            <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-300 uppercase">
              <BellRing className="h-4 w-4" /> Ready now
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {serving.ready.length === 0 && (
                <span className="text-xs text-stone-500">No tokens ready — kitchen is catching up.</span>
              )}
              {serving.ready.slice(0, 8).map((o) => (
                <span
                  key={o.id}
                  className="animate-glow rounded-lg bg-emerald-400 px-2.5 py-1 text-sm font-extrabold text-stone-950"
                >
                  {o.token}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-stone-300 uppercase">
              <ChefHat className="h-4 w-4" /> On the stove
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {serving.preparing.length === 0 && serving.orderedCount === 0 && (
                <span className="text-xs text-stone-500">Nothing cooking right now.</span>
              )}
              {serving.preparing.slice(0, 6).map((o) => (
                <span key={o.id} className="rounded-lg bg-white/10 px-2.5 py-1 text-sm font-extrabold text-amber-200">
                  {o.token}
                </span>
              ))}
              {serving.orderedCount > 0 && (
                <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-stone-400">
                  +{serving.orderedCount} queued
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
