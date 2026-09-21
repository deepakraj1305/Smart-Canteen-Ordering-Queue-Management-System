export type OrderStatus = 'Ordered' | 'Preparing' | 'Ready' | 'Collected' | 'Cancelled';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  prep_time: number;
  rating: number;
  is_veg: boolean;
  created_at: string;
}

export interface OrderLineItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

export interface Order {
  id: number;
  token: string;
  student_id: string;
  student_name: string;
  student_email: string;
  items: OrderLineItem[];
  total: number;
  status: OrderStatus;
  payment_method: string;
  estimated_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface DailyStat {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

export interface TopItem {
  name: string;
  qty: number;
  revenue: number;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  orderedCount: number;
  preparingCount: number;
  readyCount: number;
  completedOrders: number;
  cancelledOrders: number;
  revenue: number;
  todayOrders: number;
  todayRevenue: number;
  avgOrderValue: number;
  daily: DailyStat[];
  topItems: TopItem[];
}

export interface ServingInfo {
  serving_token: string;
  is_open: boolean;
  announcement: string;
  updated_at: string | null;
  ready: Order[];
  preparing: Order[];
  orderedCount: number;
}

export interface CartPayloadItem {
  id: number;
  qty: number;
}

export const CATEGORIES = [
  'South Indian',
  'North Indian',
  'Chinese',
  'Fast Food',
  'Beverages',
  'Desserts'
] as const;

export const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  Ordered: { label: 'Ordered', color: 'text-sky-700', bg: 'bg-sky-100', dot: 'bg-sky-500' },
  Preparing: { label: 'Preparing', color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  Ready: { label: 'Ready for Pickup', color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  Collected: { label: 'Collected', color: 'text-stone-600', bg: 'bg-stone-200', dot: 'bg-stone-400' },
  Cancelled: { label: 'Cancelled', color: 'text-rose-700', bg: 'bg-rose-100', dot: 'bg-rose-500' }
};

export const STATUS_ORDER: OrderStatus[] = ['Ordered', 'Preparing', 'Ready', 'Collected'];
