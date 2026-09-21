import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('menu_items').select('*').order('category', { ascending: true }).order('name', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.name || b.price === undefined || b.price === null) return res.status(400).json({ error: 'Name and price are required.' });
      if (Number(b.price) <= 0) return res.status(400).json({ error: 'Price must be greater than zero.' });
      const { data, error } = await supabase.from('menu_items').insert({
        name: String(b.name).trim(),
        description: b.description ? String(b.description).trim() : '',
        price: Number(b.price),
        category: b.category || 'Fast Food',
        image: b.image || '',
        available: b.available !== undefined ? Boolean(b.available) : true,
        prep_time: b.prep_time ? Number(b.prep_time) : 10,
        rating: b.rating ? Number(b.rating) : 4.0,
        is_veg: b.is_veg !== undefined ? Boolean(b.is_veg) : true
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const b = req.body || {};
      if (!b.id) return res.status(400).json({ error: 'Menu item id is required.' });
      const patch = {};
      if (b.name !== undefined) patch.name = String(b.name).trim();
      if (b.description !== undefined) patch.description = String(b.description);
      if (b.price !== undefined) {
        if (Number(b.price) <= 0) return res.status(400).json({ error: 'Price must be greater than zero.' });
        patch.price = Number(b.price);
      }
      if (b.category !== undefined) patch.category = b.category;
      if (b.image !== undefined) patch.image = b.image;
      if (b.available !== undefined) patch.available = Boolean(b.available);
      if (b.prep_time !== undefined) patch.prep_time = Number(b.prep_time);
      if (b.rating !== undefined) patch.rating = Number(b.rating);
      if (b.is_veg !== undefined) patch.is_veg = Boolean(b.is_veg);
      const { data, error } = await supabase.from('menu_items').update(patch).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const id = (req.query && req.query.id) || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Menu item id is required.' });
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Menu API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
