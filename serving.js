import supabase from './db-client.js';

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function getSettings() {
  const { data } = await supabase.from('canteen_settings').select('*').eq('id', 1).single();
  if (data) return data;
  const { data: created } = await supabase
    .from('canteen_settings')
    .upsert({ id: 1, serving_token: 'C101', is_open: true, announcement: 'Welcome to the college canteen! Skip the queue — order online.' })
    .select()
    .single();
  return created || { id: 1, serving_token: 'C101', is_open: true, announcement: '' };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const start = startOfTodayISO();
    if (req.method === 'GET') {
      const settings = await getSettings();
      const { data: ready } = await supabase.from('orders').select('*').eq('status', 'Ready').gte('created_at', start).order('created_at', { ascending: true }).limit(20);
      const { data: preparing } = await supabase.from('orders').select('*').eq('status', 'Preparing').gte('created_at', start).order('created_at', { ascending: true }).limit(20);
      const { count: orderedCount } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'Ordered').gte('created_at', start);
      return res.status(200).json({
        serving_token: settings.serving_token || 'C101',
        is_open: settings.is_open !== false,
        announcement: settings.announcement || '',
        updated_at: settings.updated_at || null,
        ready: ready || [],
        preparing: preparing || [],
        orderedCount: orderedCount || 0
      });
    }
    if (req.method === 'PUT') {
      const b = req.body || {};
      const patch = { updated_at: new Date().toISOString() };
      if (b.serving_token !== undefined) patch.serving_token = String(b.serving_token).trim() || 'C101';
      if (b.is_open !== undefined) patch.is_open = Boolean(b.is_open);
      if (b.announcement !== undefined) patch.announcement = String(b.announcement);
      const { data, error } = await supabase.from('canteen_settings').upsert({ id: 1, ...patch }).select().single();
      if (error) throw error;
      const { data: ready } = await supabase.from('orders').select('*').eq('status', 'Ready').gte('created_at', start).order('created_at', { ascending: true }).limit(20);
      const { data: preparing } = await supabase.from('orders').select('*').eq('status', 'Preparing').gte('created_at', start).order('created_at', { ascending: true }).limit(20);
      return res.status(200).json({
        serving_token: data.serving_token,
        is_open: data.is_open !== false,
        announcement: data.announcement || '',
        updated_at: data.updated_at || null,
        ready: ready || [],
        preparing: preparing || [],
        orderedCount: 0
      });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Serving API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
