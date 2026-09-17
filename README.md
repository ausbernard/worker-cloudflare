# worker-cloudflare

Dummy Cloudflare Worker for testing `wrangler` dev + deploy.

## Run locally

```sh
npm install
npm run dev     # http://localhost:8787
```

## Deploy

```sh
npx wrangler login      # one-time browser auth
npm run check           # wrangler deploy --dry-run (no upload)
npm run deploy          # -> https://worker-cloudflare.<your-subdomain>.workers.dev
npm run tail            # stream live logs
```

## Routes

| Route            | Description                                  |
| ---------------- | -------------------------------------------- |
| `GET /`          | HTML landing page                            |
| `GET /health`    | `{ ok: true, timestamp }`                    |
| `GET /env`       | vars + request metadata (colo, country, ray) |
| `GET /echo?a=b`  | echoes query params                          |
| `POST /echo`     | echoes request body                          |

Config lives in `wrangler.jsonc` (worker name, `compatibility_date`, the
`GREETING` var, and a commented-out KV binding to test bindings).
