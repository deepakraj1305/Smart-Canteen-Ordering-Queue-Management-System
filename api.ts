import type { CartPayloadItem, DashboardStats, MenuItem, Order, ServingInfo } from './types';

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || 'Request failed (' + res.status + ')');
  }
  return (await res.json()) as T;
}

/* ---------- Menu ---------- */
export const fetchMenu = () => req<MenuItem[]>('/api/menu');
export const createMenuItem = (data: Partial<MenuItem>) =>
  req<MenuItem>('/api/menu', { method: 'POST', body: JSON.stringify(data) });
export const updateMenuItem = (id: number, data: Partial<MenuItem>) =>
  req<MenuItem>('/api/menu', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
export const deleteMenuItem = (id: number) =>
  req<{ ok: boolean }>('/api/menu?id=' + id, { method: 'DELETE' });

/* ---------- Orders ---------- */
export function fetchOrders(params?: { student_id?: string; status?: string; today?: boolean; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.student_id) q.set('student_id', params.student_id);
  if (params?.status) q.set('status', params.status);
  if (params?.today) q.set('today', 'true');
  if (params?.limit) q.set('limit', String(params.limit));
  const suffix = q.toString() ? '?' + q.toString() : '';
  return req<Order[]>('/api/orders' + suffix);
}

export const fetchOrderById = (id: number | string) => req<Order>('/api/orders?id=' + id);

export const placeOrder = (data: {
  student_id: string;
  student_name: string;
  student_email: string;
  items: CartPayloadItem[];
  payment_method: string;
}) => req<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) });

export const updateOrderStatus = (id: number, status: string) =>
  req<Order>('/api/orders', { method: 'PUT', body: JSON.stringify({ id, status }) });

export const deleteOrder = (id: number) =>
  req<{ ok: boolean }>('/api/orders?id=' + id, { method: 'DELETE' });

/* ---------- Stats & serving ---------- */
export const fetchStats = () => req<DashboardStats>('/api/stats');
export const fetchServing = () => req<ServingInfo>('/api/serving');
export const updateServing = (data: { serving_token?: string; is_open?: boolean; announcement?: string }) =>
  req<ServingInfo>('/api/serving', { method: 'PUT', body: JSON.stringify(data) });

/* ---------- Format helpers ---------- */
export const inr = (n: number | string) => '\u20B9' + Number(n).toLocaleString('en-IN');

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' hr ago';
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'yesterday' : days + ' days ago';
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function minutesLeft(order: Order): number {
  const readyAt = new Date(order.created_at).getTime() + order.estimated_minutes * 60000;
  return Math.max(0, Math.round((readyAt - Date.now()) / 60000));
}
