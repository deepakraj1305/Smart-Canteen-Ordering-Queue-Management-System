import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { inr } from '../lib/api';

export default function CartDrawer() {
  const { lines, count, total, isOpen, setOpen, setQty, remove, clear } = useCart();
  const navigate = useNavigate();

  const checkout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-amber-50 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-orange-100 bg-white px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                  <ShoppingCart className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-extrabold text-stone-900">Your Tray</h2>
                  <p className="text-xs font-medium text-stone-500">
                    {count} item{count === 1 ? '' : 's'} in cart
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="thin-scroll flex-1 space-y-3 overflow-y-auto p-5">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-white text-4xl shadow-md">🍱</span>
                  <h3 className="font-display text-lg font-bold text-stone-900">Your tray is empty</h3>
                  <p className="mt-1 max-w-60 text-sm text-stone-500">
                    Add something tasty from the menu — hot dosas, crispy rolls and more.
                  </p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/menu');
                    }}
                    className="mt-5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:bg-orange-700"
                  >
                    Browse menu
                  </button>
                </div>
              ) : (
                lines.map(({ item, qty }) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-3"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-orange-100 text-2xl">🍽️</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-bold text-stone-900">{item.name}</p>
                        <button
                          onClick={() => remove(item.id)}
                          className="text-stone-400 transition hover:text-rose-600"
                          aria-label={'Remove ' + item.name}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-stone-500">{inr(item.price)} each</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-lg border border-stone-200 p-0.5">
                          <button
                            onClick={() => setQty(item.id, qty - 1)}
                            className="grid h-7 w-7 place-items-center rounded-md transition hover:bg-stone-100"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-5 text-center text-sm font-extrabold">{qty}</span>
                          <button
                            onClick={() => setQty(item.id, qty + 1)}
                            className="grid h-7 w-7 place-items-center rounded-md transition hover:bg-stone-100"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="font-display text-sm font-extrabold text-stone-900">{inr(item.price * qty)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {lines.length > 0 && (
              <div className="space-y-3 border-t border-orange-100 bg-white p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-500">Subtotal</span>
                  <span className="font-bold text-stone-900">{inr(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-500">Canteen discount (student)</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-stone-200 pt-3">
                  <span className="font-display text-base font-extrabold text-stone-900">To pay at counter</span>
                  <span className="font-display text-xl font-extrabold text-orange-600">{inr(total)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clear}
                    className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-500 transition hover:bg-stone-100"
                  >
                    Clear
                  </button>
                  <button
                    onClick={checkout}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-600/30 transition hover:brightness-110 active:scale-[0.98]"
                  >
                    Checkout <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
