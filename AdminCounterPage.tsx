import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, BellRing, ChefHat, Loader2, Megaphone, Power, Ticket } from 'lucide-react';
import { fetchServing, inr, updateServing } from '../lib/api';
import type { ServingInfo } from '../lib/types';
import { AdminSidebar } from '../components/Navbar';
import PageLoader, { ErrorBanner } from '../components/Loaders';

export default function AdminCounterPage() {
  const [serving, setServing] = useState<ServingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [saved, setSaved] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchServing();
      setServing(data);
      setTokenInput(data.serving_token);
      setAnnouncement(data.announcement);
      setIsOpen(data.is_open);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load counter settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Serving token cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved('');
    try {
      const updated = await updateServing({
        serving_token: tokenInput.trim().toUpperCase(),
        announcement: announcement.trim(),
        is_open: isOpen
      });
      setServing(updated);
      setSaved('Counter display updated — students see this instantly.');
      setTimeout(() => setSaved(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const advance = async () => {
    const current = (serving?.serving_token || 'C101').trim();
    const num = parseInt(current.replace(/\D/g, ''), 10);
    const prefix = current.replace(/[0-9]/g, '') || 'C';
    const next = prefix + (isNaN(num) ? 101 : num + 1);
    setTokenInput(next);
    try {
      const updated = await updateServing({ serving_token: next });
      setServing(updated);
      setSaved('Now serving ' + next);
      setTimeout(() => setSaved(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not advance token.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 lg:pl-64">
      <AdminSidebar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <h1 className="font-display flex items-center gap-2.5 text-2xl font-extrabold text-white sm:text-3xl">
          <Ticket className="h-7 w-7 text-orange-400" /> Serving Counter
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          Control the big "Now Serving" display, canteen open/close status and announcements.
        </p>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <PageLoader label="Loading counter..." />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <form onSubmit={save} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              {error && <ErrorBanner message={error} />}
              {saved && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300">
                  {saved}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-extrabold tracking-widest text-stone-400 uppercase">
                  Now-serving token
                </label>
                <div className="flex gap-2">
                  <input
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    placeholder="C104"
                    className="font-display w-full rounded-xl border border-white/10 bg-stone-950/60 px-4 py-3 text-2xl font-extrabold tracking-widest text-amber-300 outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={advance}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-sm font-extrabold text-stone-950 transition hover:brightness-110"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold tracking-widest text-stone-400 uppercase">
                  <Megaphone className="h-3.5 w-3.5" /> Announcement ticker
                </label>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows={2}
                  placeholder="e.g. Today only: free gulab jamun with every thali!"
                  className="w-full resize-none rounded-xl border border-white/10 bg-stone-950/60 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-stone-600 focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                <span className="flex items-center gap-2.5">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${isOpen ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                    <Power className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-white">Canteen is {isOpen ? 'OPEN' : 'CLOSED'}</span>
                    <span className="block text-xs text-stone-400">Students {isOpen ? 'can' : 'cannot'} place new orders</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen((v) => !v)}
                  className={`relative h-7 w-13 w-14 rounded-full transition ${isOpen ? 'bg-emerald-500' : 'bg-stone-600'}`}
                  aria-label="Toggle canteen open"
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${isOpen ? 'left-8' : 'left-1'}`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Publish to displays
              </button>
            </form>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-stone-900">
                <p className="border-b border-white/10 px-5 py-3 text-xs font-extrabold tracking-widest text-stone-400 uppercase">
                  Live preview — student display
                </p>
                <div className="p-6 text-center">
                  <p className="text-xs font-bold tracking-[0.3em] text-orange-300 uppercase">Now serving</p>
                  <p className="font-display bg-gradient-to-br from-amber-200 via-orange-400 to-red-500 bg-clip-text text-7xl font-extrabold text-transparent">
                    {serving?.serving_token ?? '—'}
                  </p>
                  <p className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-extrabold ${serving?.is_open ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                    {serving?.is_open ? '● CANTEEN OPEN' : '● CANTEEN CLOSED'}
                  </p>
                  {serving?.announcement && (
                    <p className="mx-auto mt-3 max-w-sm text-sm font-medium text-amber-200/90">📢 {serving.announcement}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold tracking-widest text-emerald-300 uppercase">
                    <BellRing className="h-4 w-4" /> Ready ({serving?.ready.length ?? 0})
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(serving?.ready || []).map((o) => (
                      <span key={o.id} className="rounded-lg bg-emerald-400 px-2 py-1 text-xs font-extrabold text-stone-950" title={o.student_name + ' · ' + inr(o.total)}>
                        {o.token}
                      </span>
                    ))}
                    {(serving?.ready.length ?? 0) === 0 && <span className="text-xs text-stone-500">None ready</span>}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold tracking-widest text-stone-300 uppercase">
                    <ChefHat className="h-4 w-4" /> Cooking ({serving?.preparing.length ?? 0})
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(serving?.preparing || []).map((o) => (
                      <span key={o.id} className="rounded-lg bg-white/10 px-2 py-1 text-xs font-extrabold text-amber-200">
                        {o.token}
                      </span>
                    ))}
                    {(serving?.preparing.length ?? 0) === 0 && <span className="text-xs text-stone-500">Nothing cooking</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
