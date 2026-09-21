import { BellRing, Radio } from 'lucide-react';
import { StudentNavbar } from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import ServingBoard from '../components/ServingBoard';

export default function ServingPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      <StudentNavbar />
      <CartDrawer />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-950 text-amber-300">
            <BellRing className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display flex items-center gap-2 text-2xl font-extrabold text-stone-950 sm:text-3xl">
              Live Pickup Counter
              <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-extrabold tracking-widest text-rose-700 uppercase">
                <Radio className="h-3 w-3 animate-pulse" /> Live
              </span>
            </h1>
            <p className="mt-0.5 text-sm text-stone-500">
              Same display as the canteen TV — refresh-free token updates every 10 seconds.
            </p>
          </div>
        </div>
        <ServingBoard />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { t: 'Green tokens', d: 'Ready for pickup — walk to the counter now.' },
            { t: 'Amber tokens', d: 'On the stove — almost your turn.' },
            { t: 'Queued count', d: 'Orders waiting for the kitchen to start.' }
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-sm font-extrabold text-stone-900">{c.t}</p>
              <p className="mt-0.5 text-xs text-stone-500">{c.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
