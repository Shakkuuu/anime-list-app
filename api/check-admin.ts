import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // JWT検証
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header', isAdmin: false })
    }

    const token = authHeader.replace('Bearer ', '')

    // Supabase Admin Clientで検証
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Missing environment variables', isAdmin: false })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // JWTを検証
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token)

    if (verifyError || !user) {
      return res.status(401).json({ error: 'Invalid token', isAdmin: false })
    }

    // 管理者チェック
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    const isAdmin = !adminError && !!adminData

    return res.status(200).json({ isAdmin })
  } catch (error: any) {
    console.error('Error in /api/check-admin:', error)
    return res.status(500).json({
      error: 'Internal server error',
      isAdmin: false,
    })
  }
}

