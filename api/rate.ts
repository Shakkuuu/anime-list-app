import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { annictId, rating } = req.body

    if (!annictId || (rating && !['favorite', 'recommended'].includes(rating))) {
      return res.status(400).json({ error: 'Invalid request body' })
    }

    // JWT検証
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')

    // Supabase Admin Clientで検証
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Missing environment variables' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // JWTを検証
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token)

    if (verifyError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // 管理者チェック
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminData) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    // 評価を Upsert
    const { error: upsertError } = await supabase
      .from('ratings')
      .upsert({
        annict_id: annictId,
        rating: rating || null,
        updated_at: new Date().toISOString(),
      })

    if (upsertError) {
      console.error('Error upserting rating:', upsertError)
      return res.status(500).json({ error: 'Failed to save rating' })
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error in /api/rate:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
}

