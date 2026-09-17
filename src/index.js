/**
 * Dummy Cloudflare Worker for testing `wrangler dev` / `wrangler deploy`.
 *
 * Routes:
 *   GET  /          -> HTML landing page
 *   GET  /health    -> { ok: true }
 *   GET  /env       -> vars + request metadata (colo, country, ray id)
 *   GET  /echo      -> echoes query string
 *   POST /echo      -> echoes the request body
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cf = request.cf ?? {};

    switch (url.pathname) {
      case "/":
        return html(landingPage(env.GREETING, cf));

      case "/health":
        return json({ ok: true, timestamp: new Date().toISOString() });

      case "/env":
        return json({
          greeting: env.GREETING ?? null,
          method: request.method,
          colo: cf.colo ?? null,
          country: cf.country ?? null,
          city: cf.city ?? null,
          rayId: request.headers.get("cf-ray"),
        });

      case "/echo": {
        if (request.method === "POST") {
          const body = await request.text();
          return json({ method: "POST", body });
        }
        return json({
          method: request.method,
          query: Object.fromEntries(url.searchParams),
        });
      }

      default:
        return json({ error: "not found", path: url.pathname }, 404);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function landingPage(greeting, cf) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>worker-cloudflare</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 40rem;
           margin: 4rem auto; padding: 0 1.5rem; line-height: 1.6; }
    code { background: #f4f4f5; padding: 0.15em 0.4em; border-radius: 4px; }
    li { margin: 0.35rem 0; }
  </style>
</head>
<body>
  <h1>worker-cloudflare</h1>
  <p>${greeting ?? "it works"} ${cf.colo ? `(served from <code>${cf.colo}</code>)` : ""}</p>
  <ul>
    <li><a href="/health">/health</a> — liveness check</li>
    <li><a href="/env">/env</a> — vars &amp; request metadata</li>
    <li><a href="/echo?hello=world">/echo?hello=world</a> — echo query params</li>
  </ul>
</body>
</html>`;
}
