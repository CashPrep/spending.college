// api/jobs.js
export default async function handler(req, res) {
  // Allow GET from your site
  res.setHeader('Access-Control-Allow-Origin', 'https://spending.college');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { town, state, keyword, targetMin, maxHours } = req.query;

  if (!town || !state) {
    return res.status(400).json({ error: 'town and state are required' });
  }

  const location = `${town}, ${state.toUpperCase()}`;
  const searchKeyword = keyword && keyword.trim() ? keyword : 'student part-time';

  // Your Adzuna credentials
  const appId = '0bbfaee4';
  const appKey = '3e9ad418fe5c302d0e08735b693950ec';

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    where: location,
    what: searchKeyword,
    results_per_page: '20',
    'content-type': 'application/json',
  });

  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Adzuna error', status: response.status });
    }

    const data = await response.json();

    // Compute hourlyTarget for highlighting, if client sent inputs
    let hourlyTarget = null;
    const tMin = Number(targetMin || 0);
    const mHours = Number(maxHours || 0);
    if (tMin > 0 && mHours > 0) {
      hourlyTarget = tMin / mHours;
    }

    return res.status(200).json({
      ...data,
      hourlyTarget,
    });
  } catch (err) {
    console.error('Adzuna proxy error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
