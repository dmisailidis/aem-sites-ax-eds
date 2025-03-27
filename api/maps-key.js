// api/maps-key.js
export default function mapsKey(req, context) {
  // Access the environment variable from Cloud Manager
  const apiKey = context.env.GOOGLE_MAP_API;

  if (!apiKey) {
    return {
      status: 500,
      body: JSON.stringify({ error: 'API key not configured' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  return {
    body: JSON.stringify({ key: apiKey }),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, private',
      'X-Frame-Options': 'DENY',
    },
  };
}
