export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Handle CORS preflight
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
  
  // Forward path and search params (e.g. /v1beta/models/gemini-2.5-flash:generateContent?key=...)
  const targetUrl = `https://generativelanguage.googleapis.com${url.pathname}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set('Host', 'generativelanguage.googleapis.com');
  
  // Strip origin tracking headers
  headers.delete('x-forwarded-for');
  headers.delete('x-real-ip');
  headers.delete('cf-connecting-ip');

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
