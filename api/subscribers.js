export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { createClient } = require('@supabase/supabase-js')
  const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  )

  const payload = req.body
  const { data, error } = await db.from('subscribers').insert(payload)
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}
