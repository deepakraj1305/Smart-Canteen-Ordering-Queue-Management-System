import { UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25">
        <UtensilsCrossed className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={`font-display block text-[15px] font-800 font-extrabold tracking-tight ${light ? 'text-white' : 'text-stone-900'}`}>
            Smart Food Pickup
          </span>
          <span className={`block text-[11px] font-semibold tracking-[0.18em] uppercase ${light ? 'text-orange-200' : 'text-orange-600'}`}>
            Campus Canteen
          </span>
        </span>
      )}
    </Link>
  );
}
