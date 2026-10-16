# AIGENTZ frontend

Run the standalone frontend:

```bash
npm install
npm run dev
```

Open the local address printed by Vite. Sign in with any email and nonempty password. This is a **browser-only demo**: the password is never sent or saved. Your demo session, onboarding choices, and recommendation approvals are stored in this browser. Dashboard, performance, reports, and assistant examples use illustrative data. Approving a recommendation changes only the local demo state; it does not update an ad account. Reports can be exported or added as a calendar reminder, but automatic delivery requires a server.

To use a connected backend instead, set `VITE_API_BASE_URL` to its origin before starting Vite. `VITE_DEMO_MODE=true` explicitly forces the standalone demo; `VITE_DEMO_MODE=false` explicitly disables it.

```bash
npm run build
npm test
```
