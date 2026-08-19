function buildDailyRanges(days) {
  const ranges = []
  for (let i = days; i >= 1; i--) ranges.push(`${i}-${i}`)
  return ranges
}

async function callUptime(body) {
  const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  return response.json()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY not configured' })
  }

  const days = Math.min(7, Math.max(1, parseInt(req.query?.days || '7', 10)))
  const base = {
    api_key: apiKey,
    format: 'json',
    response_times: '1',
    response_times_limit: '30',
    logs: '1',
  }

  let data = null
  // try daily ranges first; UptimeRobot may reject too many — fall back to plain
  try {
    data = await callUptime(new URLSearchParams({
      ...base,
      custom_uptime_ranges: buildDailyRanges(days).join(','),
    }))
    if (data.stat !== 'ok') {
      const plain = await callUptime(new URLSearchParams(base))
      data = plain
    }
  } catch (err) {
    try {
      data = await callUptime(new URLSearchParams(base))
    } catch (e2) {
      return res.status(500).json({ error: e2.message })
    }
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
  return res.status(200).json(data)
}