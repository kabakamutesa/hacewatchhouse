export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { createClient } = require('@supabase/supabase-js')
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const db = createClient(SUPABASE_URL, SUPABASE_KEY)

  const id = req.query.id
  let query = db.from('products').select('*').gt('stock', 0).order('created_at', { ascending: false })
  if (id) query = db.from('products').select('*').eq('id', id).single()

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
