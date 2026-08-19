function buildDailyRanges(days) {
  // "i-i" = 最近 i 天到最近 i-1 天，i=1 为今天；返回从旧到新供前端顺序展示
  const ranges = []
  for (let i = days; i >= 1; i--) ranges.push(`${i}-${i}`)
  return ranges
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY not configured' })
  }

  const days = Math.min(90, Math.max(1, parseInt(req.query?.days || '30', 10)))

  try {
    const body = new URLSearchParams({
      api_key: apiKey,
      format: 'json',
      response_times: '1',
      response_times_limit: '30',
      custom_uptime_ranges: buildDailyRanges(days).join(','),
    })

    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const data = await response.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}