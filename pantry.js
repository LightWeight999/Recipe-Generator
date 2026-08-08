import { kv } from '@vercel/kv';

const DEFAULT_DAILY_CAP = 50;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY. Add it in Vercel project settings.' });
    return;
  }

  const cap = Number(process.env.DAILY_REQUEST_CAP) || DEFAULT_DAILY_CAP;
  const today = new Date().toISOString().slice(0, 10);
  const counterKey = 'pantry-print:requests:' + today;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const count = await kv.incr(counterKey);
      if (count === 1) {
        await kv.expire(counterKey, 60 * 60 * 26);
      }
      if (count > cap) {
        res.status(429).json({ error: 'This demo has hit its usage cap for today. Try again tomorrow.' });
        return;
      }
    } catch (err) {
      console.error('Rate limit check failed, allowing request through:', err.message);
    }
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await anthropicResponse.json();
    res.status(anthropicResponse.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Proxy request failed' });
  }
}
