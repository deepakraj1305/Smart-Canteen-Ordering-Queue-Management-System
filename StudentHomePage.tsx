import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Leaf, Search, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMenu, inr } from '../lib/api';
import { CATEGORIES } from '../lib/types';
import type { MenuItem } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { StudentNavbar } from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import FoodCard from '../components/FoodCard';
import ServingBoard from '../components/ServingBoard';
import { EmptyMenu, ErrorBanner, MenuSkeleton } from '../components/Loaders';

type SortKey = 'popular' | 'price-low' | 'price-high' | 'fastest';

export default function StudentHomePage() {
  const { displayName } = useAuth();
  const { count, total, setOpen } = useCart();
  const navigate = useNavigate();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchMenu();
      setMenu(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let rows = [...menu];
    if (category !== 'All') rows = rows.filter((r) => r.category === category);
    if (vegOnly) rows = rows.filter((r) => r.is_veg);
    if (availableOnly) rows = rows.filter((r) => r.available);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s)
      );
    }
    switch (sort) {
      case 'price-low':
        rows.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        rows.sort((a, b) => b.price - a.price);
        break;
      case 'fastest':
        rows.sort((a, b) => a.prep_time - b.prep_time);
        break;
      default:
        rows.sort((a, b) => b.rating - a.rating);
    }
    return rows;
  }, [menu, category, vegOnly, availableOnly, search, sort]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setVegOnly(false);
    setAvailableOnly(false);
    setSort('popular');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-amber-50 pb-28 md:pb-10">
      <StudentNavbar />
      <CartDrawer />

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        <ServingBoard compact />

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-stone-950 sm:text-3xl">
              {greeting}, {displayName || 'foodie'}! 🍽️
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {menu.filter((m) => m.available).length} dishes available right now — order ahead and skip the queue.
            </p>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="sticky top-16 z-30 -mx-4 bg-amber-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-stone-200 bg-white px-4 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
              <Search className="h-5 w-5 shrink-0 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dosa, biryani, shakes..."
                className="w-full bg-transparent py-3 text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs font-bold text-stone-400 hover:text-stone-600">
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 rounded-2xl border px-4 text-sm font-bold shadow-sm transition ${
                showFilters || vegOnly || availableOnly || sort !== 'popular'
                  ? 'border-orange-500 bg-orange-600 text-white'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {['All', ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition ${
                  category === c
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:text-orange-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-white p-3">
                  <button
                    onClick={() => setVegOnly((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      vegOnly ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Leaf className="h-3.5 w-3.5" /> Veg only
                  </button>
                  <button
                    onClick={() => setAvailableOnly((v) => !v)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      availableOnly ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Available now
                  </button>
                  <div className="flex items-center gap-1.5 rounded-xl bg-stone-100 px-2 py-1">
                    <ArrowUpDown className="h-3.5 w-3.5 text-stone-500" />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="bg-transparent py-1 pr-1 text-xs font-bold text-stone-700 outline-none"
                    >
                      <option value="popular">Most popular</option>
                      <option value="price-low">Price: low to high</option>
                      <option value="price-high">Price: high to low</option>
                      <option value="fastest">Fastest to prepare</option>
                    </select>
                  </div>
                  <button onClick={resetFilters} className="ml-auto text-xs font-bold text-stone-400 hover:text-rose-600">
                    Reset all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <ErrorBanner message={error} onRetry={load} />}

        {loading ? (
          <MenuSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyMenu onReset={resetFilters} />
        ) : (
          <>
            <p className="text-xs font-bold tracking-wide text-stone-400 uppercase">
              Showing {filtered.length} dish{filtered.length === 1 ? '' : 'es'}
              {category !== 'All' ? ' in ' + category : ''}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item, i) => (
                <FoodCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Floating cart bar */}
      <AnimatePresence>
        {count > 0 && (
          <motion.button
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-lg items-center justify-between rounded-2xl bg-stone-950 px-5 py-4 text-white shadow-2xl transition hover:bg-stone-900 md:inset-x-auto md:right-8 md:left-auto md:w-96"
          >
            <span className="flex items-center gap-3">
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-extrabold">
                  {count}
                </span>
              </span>
              <span className="text-left">
                <span className="block text-[11px] font-semibold text-stone-400">Total payable</span>
                <span className="font-display block text-lg leading-none font-extrabold">{inr(total)}</span>
              </span>
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2.5 text-sm font-extrabold">
              View tray →
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* mobile bottom padding guard */}
      <div className="h-2 md:hidden" />
      <div className="sr-only">
        <button onClick={() => navigate('/checkout')} />
      </div>
    </div>
  );
}
