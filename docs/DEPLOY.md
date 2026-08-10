# Deploy — Choice OS

Shell is ready. **Only these steps are left for you.**

## 1. Provision a VPS

Any provider works — needs Docker + Docker Compose installed, and a public IP.

## 2. Point DNS through Cloudflare

Add an A record for your chosen domain → the VPS's public IP, proxy status **on** (orange cloud).

## 3. Generate a Cloudflare Origin CA certificate

Cloudflare dashboard → SSL/TLS → Origin Server → Create Certificate. Save the two outputs as:

```
nginx/certs/cert.pem
nginx/certs/key.pem
```

Both are gitignored — never commit them.

## 4. Set Cloudflare's SSL/TLS mode to "Full (strict)"

Cloudflare dashboard → SSL/TLS → Overview. This is the mode the origin cert from step 3 is for.

## 5. Environment

```bash
cp .env.example .env.production
# fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, NEXT_PUBLIC_SITE_URL (the real https domain)
```

## 6. Replace the placeholder domain

Edit `nginx/nginx.conf` — swap `choice.example.com` for the real domain in **both** `server_name` lines.

## 7. Launch

```bash
docker compose up -d --build
```

## 8. Verify

```bash
curl https://<your-domain>/api/health
# {"status":"ok"}
```

Then click through `/`, `/kds`, `/admin` for real against the live Supabase project.
