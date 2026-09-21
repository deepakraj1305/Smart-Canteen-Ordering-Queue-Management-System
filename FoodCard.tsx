import { motion } from 'framer-motion';
import { Clock3, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { inr } from '../lib/api';
import type { MenuItem } from '../lib/types';
import { useCart } from '../contexts/CartContext';

function VegMark({ veg }: { veg: boolean }) {
  return (
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border-2 ${veg ? 'border-emerald-600' : 'border-rose-600'}`}
      title={veg ? 'Veg' : 'Non-veg'}
    >
      <span className={`h-2 w-2 rounded-full ${veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
    </span>
  );
}

function FoodImage({ item }: { item: MenuItem }) {
  if (!item.image) {
    return (
      <div className="grid h-44 w-full place-items-center bg-gradient-to-br from-orange-100 to-amber-100 text-5xl">
        🍽️
      </div>
    );
  }
  return (
    <img
      src={item.image}
      alt={item.name}
      loading="lazy"
      className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

export default function FoodCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const { add, setQty, qtyOf, setOpen } = useCart();
  const qty = qtyOf(item.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -5 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-orange-500/10 ${
        item.available ? 'border-stone-200' : 'border-stone-200 opacity-90'
      }`}
    >
      <div className="relative overflow-hidden">
        <FoodImage item={item} />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-stone-700 shadow-sm backdrop-blur">
            {item.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 rounded-full bg-stone-900/85 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur">
            <Star className="h-3 w-3 fill-amber-300" /> {Number(item.rating).toFixed(1)}
          </span>
        </div>
        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-stone-950/55">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-extrabold tracking-wide text-stone-800 uppercase">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] leading-snug font-bold text-stone-900">{item.name}</h3>
          <VegMark veg={item.is_veg} />
        </div>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-stone-500">{item.description || 'Freshly prepared at the campus canteen.'}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="font-display text-lg font-extrabold text-stone-900">{inr(item.price)}</p>
            <p className="flex items-center gap-1 text-[11px] font-semibold text-stone-400">
              <Clock3 className="h-3 w-3" /> ~{item.prep_time} min
            </p>
          </div>
          {item.available ? (
            qty === 0 ? (
              <button
                onClick={() => add(item)}
                className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:bg-orange-700 active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" /> Add
              </button>
            ) : (
              <div className="flex items-center gap-1 rounded-xl bg-orange-600 p-1 text-white shadow-lg shadow-orange-600/25">
                <button
                  onClick={() => setQty(item.id, qty - 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-white/20"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(true)} className="min-w-7 text-center text-sm font-extrabold" title="View cart">
                  {qty}
                </button>
                <button
                  onClick={() => add(item)}
                  className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-white/20"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )
          ) : (
            <button disabled className="cursor-not-allowed rounded-xl bg-stone-200 px-4 py-2.5 text-sm font-bold text-stone-400">
              Unavailable
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
