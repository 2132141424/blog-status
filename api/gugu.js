const GUGU_STATUS_PAGE_ID = process.env.GUGU_STATUS_PAGE_ID || '23be993a478d407faf7f9785'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  const range = req.query?.range || '90d'
  try {
    const url = `https://dashboard.gugujiankong.com/sea/status-pages/${GUGU_STATUS_PAGE_ID}?range=${range}`
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; StatusPage/1.0)' },
    })
    const data = await response.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    return res.status(200).json(data)
  } catch (err) {
    return res.status(502).json({ error: err.message })
  }
}