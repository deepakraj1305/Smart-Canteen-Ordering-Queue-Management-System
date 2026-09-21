import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, ImagePlus, Loader2, Pencil, Plus, Search, Star, Trash2, UtensilsCrossed, X } from 'lucide-react';
import { createMenuItem, deleteMenuItem, fetchMenu, inr, updateMenuItem } from '../lib/api';
import { CATEGORIES } from '../lib/types';
import type { MenuItem } from '../lib/types';
import { AdminSidebar } from '../components/Navbar';
import { EmptyMenu, ErrorBanner, MenuSkeleton } from '../components/Loaders';

export const IMAGE_PRESETS = [
  { label: 'Masala Dosa', url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80&auto=format&fit=crop' },
  { label: 'Idli Sambar', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80&auto=format&fit=crop' },
  { label: 'Veg Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80&auto=format&fit=crop' },
  { label: 'Chole Bhature', url: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&q=80&auto=format&fit=crop' },
  { label: 'Hakka Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80&auto=format&fit=crop' },
  { label: 'Veg Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop' },
  { label: 'French Fries', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80&auto=format&fit=crop' },
  { label: 'Cold Coffee', url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80&auto=format&fit=crop' },
  { label: 'Mango Lassi', url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&q=80&auto=format&fit=crop' },
  { label: 'Gulab Jamun', url: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=600&q=80&auto=format&fit=crop' },
  { label: 'Samosa', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80&auto=format&fit=crop' },
  { label: 'Paneer Roll', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80&auto=format&fit=crop' }
];

interface FormState {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  available: boolean;
  prep_time: string;
  rating: string;
  is_veg: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  category: 'Fast Food',
  image: IMAGE_PRESETS[0].url,
  available: true,
  prep_time: '10',
  rating: '4.2',
  is_veg: true
};

function MenuForm({
  initial,
  saving,
  onClose,
  onSubmit
}: {
  initial: MenuItem | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (data: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          description: initial.description || '',
          price: String(initial.price),
          category: initial.category,
          image: initial.image || IMAGE_PRESETS[0].url,
          available: initial.available,
          prep_time: String(initial.prep_time),
          rating: String(initial.rating),
          is_veg: initial.is_veg
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Dish name is required.';
    if (!form.price.trim()) errs.price = 'Price is required.';
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Enter a valid price above ₹0.';
    if (form.prep_time && (isNaN(Number(form.prep_time)) || Number(form.prep_time) < 1))
      errs.prep_time = 'Prep time must be at least 1 minute.';
    if (!/^https?:\/\/.+/.test(form.image.trim())) errs.image = 'Enter a valid image URL (http...).';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(form);
  };

  const inputCls =
    'w-full rounded-xl border bg-stone-950/60 px-3.5 py-2.5 text-sm font-medium text-white outline-none placeholder:text-stone-600 focus:border-orange-500';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-stone-900 p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-white">
            {initial ? 'Edit dish' : 'Add new dish'}
          </h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 hover:bg-white/10" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-extrabold tracking-widest text-stone-400 uppercase">Dish name *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Paneer Butter Masala + Roti" className={`${inputCls} ${errors.name ? 'border-rose-500' : 'border-white/10'}`} />
            {errors.name && <p className="mt-1 text-xs font-semibold text-rose-400">{errors.name}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-extrabold tracking-widest text-stone-400 uppercase">Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Short tasty description..." className={`${inputCls} resize-none border-white/10`} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold tracking-widest text-stone-400 uppercase">Price (₹) *</label>
            <input value={form.price} onChange={(e) => set('price', e.target.value)} type="number" min="1" placeholder="60" className={`${inputCls} ${errors.price ? 'border-rose-500' : 'border-white/10'}`} />
            {errors.price && <p className="mt-1 text-xs font-semibold text-rose-400">{errors.price}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold tracking-widest text-stone-400 uppercase">Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={`${inputCls} border-white/10`}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold tracking-widest text-stone-400 uppercase">Prep time (min)</label>
            <input value={form.prep_time} onChange={(e) => set('prep_time', e.target.value)} type="number" min="1" max="60" className={`${inputCls} ${errors.prep_time ? 'border-rose-500' : 'border-white/10'}`} />
            {errors.prep_time && <p className="mt-1 text-xs font-semibold text-rose-400">{errors.prep_time}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold tracking-widest text-stone-400 uppercase">Rating (1–5)</label>
            <input value={form.rating} onChange={(e) => set('rating', e.target.value)} type="number" min="1" max="5" step="0.1" className={`${inputCls} border-white/10`} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-extrabold tracking-widest text-stone-400 uppercase">Image URL *</label>
            <input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." className={`${inputCls} ${errors.image ? 'border-rose-500' : 'border-white/10'}`} />
            {errors.image && <p className="mt-1 text-xs font-semibold text-rose-400">{errors.image}</p>}
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
              {IMAGE_PRESETS.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => set('image', p.url)}
                  title={p.label}
                  className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${form.image === p.url ? 'border-orange-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={p.url} alt={p.label} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            {form.image && (
              <img src={form.image} alt="Preview" className="mt-2.5 h-28 w-full rounded-xl border border-white/10 object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
            )}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm font-bold text-stone-200">Available now</span>
            <button
              type="button"
              onClick={() => set('available', !form.available)}
              className={`relative h-6 w-11 rounded-full transition ${form.available ? 'bg-emerald-500' : 'bg-stone-600'}`}
              aria-label="Toggle availability"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.available ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm font-bold text-stone-200">Vegetarian</span>
            <button
              type="button"
              onClick={() => set('is_veg', !form.is_veg)}
              className={`relative h-6 w-11 rounded-full transition ${form.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`}
              aria-label="Toggle veg"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.is_veg ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-stone-300 transition hover:bg-white/5">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {initial ? 'Save changes' : 'Add dish'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminMenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState<{ open: boolean; item: MenuItem | null }>({ open: false, item: null });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

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
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(s));
    }
    return rows;
  }, [menu, category, search]);

  const submitForm = async (f: FormState) => {
    setSaving(true);
    try {
      if (modal.item) {
        await updateMenuItem(modal.item.id, {
          name: f.name.trim(),
          description: f.description.trim(),
          price: Number(f.price),
          category: f.category,
          image: f.image.trim(),
          available: f.available,
          prep_time: Number(f.prep_time) || 10,
          rating: Math.min(5, Math.max(1, Number(f.rating) || 4)),
          is_veg: f.is_veg
        });
      } else {
        await createMenuItem({
          name: f.name.trim(),
          description: f.description.trim(),
          price: Number(f.price),
          category: f.category,
          image: f.image.trim(),
          available: f.available,
          prep_time: Number(f.prep_time) || 10,
          rating: Math.min(5, Math.max(1, Number(f.rating) || 4)),
          is_veg: f.is_veg
        });
      }
      setModal({ open: false, item: null });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    setToggling(item.id);
    try {
      await updateMenuItem(item.id, { available: !item.available });
      setMenu((prev) => prev.map((m) => (m.id === item.id ? { ...m, available: !m.available } : m)));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setToggling(null);
    }
  };

  const remove = async (item: MenuItem) => {
    if (!confirm('Remove "' + item.name + '" from the menu?')) return;
    try {
      await deleteMenuItem(item.id);
      setMenu((prev) => prev.filter((m) => m.id !== item.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 lg:pl-64">
      <AdminSidebar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display flex items-center gap-2.5 text-2xl font-extrabold text-white sm:text-3xl">
              <UtensilsCrossed className="h-7 w-7 text-orange-400" /> Menu Manager
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              {menu.length} dishes · {menu.filter((m) => m.available).length} available right now
            </p>
          </div>
          <button
            onClick={() => setModal({ open: true, item: null })}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add dish
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {['All', ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                  category === c ? 'bg-white text-stone-950' : 'border border-white/10 bg-white/5 text-stone-300 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 lg:ml-auto lg:w-72">
            <Search className="h-4 w-4 shrink-0 text-stone-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full bg-transparent py-2.5 text-sm font-medium text-white outline-none placeholder:text-stone-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} onRetry={load} />
          </div>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <MenuSkeleton count={6} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <EmptyMenu
                onReset={() => {
                  setSearch('');
                  setCategory('All');
                }}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]"
                >
                  <div className="relative">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="grid h-36 w-full place-items-center bg-white/5 text-4xl">🍽️</div>
                    )}
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                      {item.category}
                    </span>
                    <span
                      className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold backdrop-blur ${
                        item.available ? 'bg-emerald-500/90 text-white' : 'bg-stone-800/90 text-stone-300'
                      }`}
                    >
                      {item.available ? 'Available' : 'Sold out'}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-[15px] font-bold text-white">{item.name}</h3>
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 ${item.is_veg ? 'border-emerald-500' : 'border-rose-500'}`}>
                        <span className={`h-2 w-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-stone-400">{item.description || 'No description.'}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <p className="font-display text-lg font-extrabold text-amber-300">{inr(item.price)}</p>
                      <p className="flex items-center gap-2 text-[11px] font-bold text-stone-400">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {Number(item.rating).toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3 w-3" /> {item.prep_time}m
                        </span>
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
                      <button
                        onClick={() => toggleAvailability(item)}
                        disabled={toggling === item.id}
                        className={`flex-1 rounded-xl px-3 py-2 text-xs font-extrabold transition disabled:opacity-60 ${
                          item.available ? 'bg-white/10 text-stone-200 hover:bg-white/15' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                        }`}
                      >
                        {toggling === item.id ? '...' : item.available ? 'Mark sold out' : 'Mark available'}
                      </button>
                      <button
                        onClick={() => setModal({ open: true, item })}
                        className="grid w-10 place-items-center rounded-xl bg-white/10 text-stone-200 transition hover:bg-white/15"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(item)}
                        className="grid w-10 place-items-center rounded-xl border border-rose-500/30 text-rose-300 transition hover:bg-rose-500/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {modal.open && (
          <MenuForm initial={modal.item} saving={saving} onClose={() => setModal({ open: false, item: null })} onSubmit={submitForm} />
        )}
      </AnimatePresence>

      {/* hidden usage guard */}
      <span className="hidden">
        <ImagePlus className="h-4 w-4" />
      </span>
    </div>
  );
}
