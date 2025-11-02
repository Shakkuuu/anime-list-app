import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { status = 'watched' } = req.query
    const annictToken = process.env.ANNICT_TOKEN
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!annictToken || !supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Missing environment variables' })
    }

    // Annict REST APIからデータ取得
    const annictResponse = await axios.get(
      `https://api.annict.com/v1/me/works`,
      {
        params: {
          filter_status: status,
          sort_season: 'desc',
          per_page: 50,
          access_token: annictToken,
        },
      }
    )

    const works = annictResponse.data.works || []

    // Supabaseから評価データ取得
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: ratings } = await supabase
      .from('ratings')
      .select('annict_id, rating')

    const ratingsMap = new Map(
      ratings?.map((r) => [r.annict_id, r.rating]) || []
    )

    // データをマージ
    const animes = works.map((work: any) => ({
      id: work.id,
      title: work.title,
      season_name: work.season_name,
      season_name_text: work.season_name_text,
      released_on: work.released_on,
      images: {
        recommended_url: work.images?.recommended_url || '',
      },
      rating: ratingsMap.get(work.id) || null,
    }))

    return res.status(200).json({ animes })
  } catch (error: any) {
    console.error('Error in /api/list:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
}

