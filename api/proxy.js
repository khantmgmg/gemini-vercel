export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  const url = new URL(req.url);

  // 2. Remove Vercel's internal 'path' rewrite parameter
  url.searchParams.delete('path');

  // 3. Reconstruct target URL for Google Gemini
  const targetUrl = `https://generativelanguage.googleapis.com${url.pathname}${url.search}`;

  // 4. Copy and scrub request headers
  const headers = new Headers(req.headers);
  headers.set('Host', 'generativelanguage.googleapis.com');
  headers.delete('x-forwarded-for');
  headers.delete('x-real-ip');

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
    });

    const resHeaders = new Headers(response.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
