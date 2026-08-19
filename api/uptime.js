// UptimeRobot V2 custom_uptime_ranges expects unix (s) timestamp pairs: start_end,
// multiple ranges joined by '-', e.g. 1465440758_1466304758-1434682358_1434855158
function buildDailyRanges(days) {
  const now = Math.floor(Date.now() / 1000)
  const day = 86400
  const ranges = []
  for (let i = days; i >= 1; i--) {
    const start = now - i * day
    const end = now - (i - 1) * day + 1
    ranges.push(`${start}_${end}`)
  }
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

  const days = Math.min(30, Math.max(1, parseInt(req.query?.days || '30', 10)))
  const base = {
    api_key: apiKey,
    format: 'json',
    response_times: '1',
    response_times_limit: '30',
  }

  let data = null
  try {
    data = await callUptime(new URLSearchParams({
      ...base,
      custom_uptime_ranges: buildDailyRanges(days).join('-'),
    }))
    if (data.stat !== 'ok') {
      data = await callUptime(new URLSearchParams(base))
    }
  } catch (err) {
    try {
      data = await callUptime(new URLSearchParams(base))
    } catch (e2) {
      return res.status(500).json({ error: e2.message })
    }
  }

  // normalize custom_uptime_ranges to a numeric array (oldest first)
  if (data && data.stat === 'ok' && Array.isArray(data.monitors)) {
    data.monitors.forEach(m => {
      const raw = m.custom_uptime_ranges
      if (typeof raw === 'string') {
        m.custom_uptime_ranges = raw.split('-')
          .map(s => s.trim())
          .filter(s => s !== '')
          .map(Number)
      }
    })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
  return res.status(200).json(data)
}