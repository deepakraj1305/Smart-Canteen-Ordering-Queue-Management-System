import { Crown } from 'lucide-react';
import { STATUS_META } from '../lib/types';
import type { OrderStatus } from '../lib/types';

export default function StatusBadge({ status, size = 'md' }: { status: OrderStatus; size?: 'sm' | 'md' | 'lg' }) {
  const meta = STATUS_META[status];
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  };
  return (
    <span className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap ${meta.bg} ${meta.color} ${sizes[size]}`}>
      <span className={`relative flex h-2 w-2 shrink-0`}>
        {status === 'Preparing' || status === 'Ordered' ? (
          <>
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${meta.dot}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
          </>
        ) : (
          <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
        )}
      </span>
      {status === 'Ready' && <Crown className="h-3 w-3" />}
      {meta.label}
    </span>
  );
}
