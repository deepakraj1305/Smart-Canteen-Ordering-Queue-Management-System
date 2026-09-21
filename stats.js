import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(2000);
    if (error) throw error;
    const all = orders || [];
    const billable = all.filter((o) => o.status !== 'Cancelled');
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = all.filter((o) => new Date(o.created_at) >= todayStart);
    const todayBillable = todayOrders.filter((o) => o.status !== 'Cancelled');
    const revenue = billable.reduce((s, o) => s + Number(o.total || 0), 0);
    const todayRevenue = todayBillable.reduce((s, o) => s + Number(o.total || 0), 0);

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const inDay = all.filter((o) => {
        const t = new Date(o.created_at);
        return t >= d && t < next;
      });
      const rev = inDay.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.total || 0), 0);
      days.push({
        date: d.toISOString(),
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        orders: inDay.length,
        revenue: Math.round(rev)
      });
    }

    const itemAgg = {};
    for (const o of billable) {
      const lines = Array.isArray(o.items) ? o.items : [];
      for (const l of lines) {
        if (!itemAgg[l.name]) itemAgg[l.name] = { name: l.name, qty: 0, revenue: 0 };
        itemAgg[l.name].qty += Number(l.qty) || 0;
        itemAgg[l.name].revenue += (Number(l.price) || 0) * (Number(l.qty) || 0);
      }
    }
    const topItems = Object.values(itemAgg).sort((a, b) => b.qty - a.qty).slice(0, 5);

    return res.status(200).json({
      totalOrders: all.length,
      pendingOrders: all.filter((o) => o.status === 'Ordered' || o.status === 'Preparing').length,
      orderedCount: all.filter((o) => o.status === 'Ordered').length,
      preparingCount: all.filter((o) => o.status === 'Preparing').length,
      readyCount: all.filter((o) => o.status === 'Ready').length,
      completedOrders: all.filter((o) => o.status === 'Collected').length,
      cancelledOrders: all.filter((o) => o.status === 'Cancelled').length,
      revenue: Math.round(revenue),
      todayOrders: todayOrders.length,
      todayRevenue: Math.round(todayRevenue),
      avgOrderValue: billable.length ? Math.round(revenue / billable.length) : 0,
      daily: days,
      topItems
    });
  } catch (err) {
    console.error('Stats API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
