# ZTA Firewall Dashboard

Web dashboard for a Zero Trust firewall built on nftables. It shows live
firewall logs, attack statistics and the device registry, and lets an
administrator add firewall rules, block IP addresses and register devices.

Live: https://firewall.kshitijsinghbhati.in

| Page | Shows |
|---|---|
| Dashboard | Events, unique attackers and blocked packets (last 7 days), log types, daily activity, top attackers, recent logs |
| Live Logs | Filterable log table with raw kernel log lines and CSV export |
| Firewall Rules | Active rules, add rule, quick block |
| Devices | Registered devices by zone (trusted / untrust / DMZ) with trust scores |
| Threat Intel | Attacker leaderboard with geolocation, live attack feed, attacks per hour |

## Read-only demo and admin mode

Anyone can view the dashboard. Changing the firewall needs the admin key: click
**Read-only** at the top right and enter it. The key is checked by the API, kept
only for the current browser tab, and every admin action is audited on the server.

## Development

```bash
npm ci
cp .env.example .env        # DEV_API_TARGET = where the FastAPI backend runs
npm run dev                 # http://localhost:3000, /api is proxied to the backend
```

## Production

`./deploy.sh` on the server (run as a normal user, not root) pulls the code,
builds it, and configures nginx: it serves the app, proxies `/api` to the
backend, and sends the security headers (CSP, HSTS, frame and content-type
protection).

Stack: React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, Recharts.
Backend: FastAPI + MySQL + nftables (separate `zta_engine` project).
Geolocation of attacker IPs uses ipwho.is from the visitor's browser.
