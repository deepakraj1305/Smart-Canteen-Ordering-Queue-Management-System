import supabase from './db-client.js';

const FLOW = {
  Ordered: ['Preparing', 'Cancelled'],
  Preparing: ['Ready', 'Cancelled'],
  Ready: ['Collected'],
  Collected: [],
  Cancelled: []
};

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function generateToken() {
  const start = startOfTodayISO();
  const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', start);
  const num = 101 + (count || 0);
  for (let i = 0; i < 80; i++) {
    const token = 'C' + (num + i);
    const { data } = await supabase.from('orders').select('id').eq('token', token).gte('created_at', start).limit(1);
    if (!data || data.length === 0) return token;
  }
  return 'C' + String(Date.now()).slice(-4);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { id, student_id, status, today, limit } = req.query;
      if (id) {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Order not found.' });
        return res.status(200).json(data);
      }
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (student_id) query = query.eq('student_id', student_id);
      if (status && status !== 'All') query = query.eq('status', status);
      if (today === 'true' || today === '1') query = query.gte('created_at', startOfTodayISO());
      query = query.limit(Math.min(Number(limit) || 200, 500));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.student_id) return res.status(400).json({ error: 'You must be logged in to place an order.' });
      if (!Array.isArray(b.items) || b.items.length === 0) return res.status(400).json({ error: 'Your cart is empty.' });
      const ids = b.items.map((i) => i.id).filter(Boolean);
      if (ids.length === 0) return res.status(400).json({ error: 'Invalid cart items.' });
      const { data: menuRows, error: menuErr } = await supabase
        .from('menu_items')
        .select('id,name,price,prep_time,image,available')
        .in('id', ids);
      if (menuErr) throw menuErr;
      const byId = Object.fromEntries((menuRows || []).map((m) => [m.id, m]));
      const lines = [];
      let maxPrep = 8;
      let totalQty = 0;
      for (const it of b.items) {
        const m = byId[it.id];
        const qty = Math.max(1, Math.min(20, Number(it.qty) || 1));
        if (!m) return res.status(400).json({ error: 'One of the items is no longer on the menu.' });
        if (m.available === false) return res.status(400).json({ error: m.name + ' is currently unavailable. Please remove it.' });
        lines.push({ id: m.id, name: m.name, price: Number(m.price), qty, image: m.image || '' });
        maxPrep = Math.max(maxPrep, Number(m.prep_time) || 8);
        totalQty += qty;
      }
      const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['Ordered', 'Preparing'])
        .gte('created_at', startOfTodayISO());
      const queueLoad = Math.min(20, (pendingCount || 0) * 2);
      const estimated = Math.max(5, Math.min(45, Math.round(maxPrep + totalQty * 1 + queueLoad * 0.6)));
      const token = await generateToken();
      const { data, error } = await supabase.from('orders').insert({
        token,
        student_id: String(b.student_id),
        student_name: b.student_name || 'Student',
        student_email: b.student_email || '',
        items: lines,
        total,
        status: 'Ordered',
        payment_method: b.payment_method || 'UPI',
        estimated_minutes: estimated
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id || !status) return res.status(400).json({ error: 'Order id and status are required.' });
      const { data: current, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single();
      if (fetchErr || !current) return res.status(404).json({ error: 'Order not found.' });
      const allowed = FLOW[current.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Cannot change status from ' + current.status + ' to ' + status + '.' });
      }
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const id = (req.query && req.query.id) || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Order id is required.' });
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Orders API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
