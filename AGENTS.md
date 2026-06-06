<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

**LeadManager** is a client-only Next.js 16 CRM (leads, pipeline Kanban, referidores, agentes, reportes). All state is persisted in the browser via Zustand + `localStorage`; there is no backend, database, Docker, or auth.

### Services

| Service | Port | Command |
|---------|------|---------|
| Next.js dev server | 3000 | `npm run dev` |

Only the Next.js dev server is required for end-to-end development and testing.

### Common commands

See `package.json` scripts and `README.md`:

- **Install deps:** `npm install`
- **Dev server:** `npm run dev` → http://localhost:3000 (redirects to `/dashboard`)
- **Lint:** `npm run lint`
- **Build:** `npm run build`
- **Production:** `npm run build && npm start`

There is no test runner configured in this repo.

### Gotchas

- Root `/` redirects to `/dashboard`.
- Data is seeded on first load and stored in `localStorage`; clearing browser storage resets demo data.
- Google Fonts (Geist) load via `next/font/google`; offline dev may fall back on typography but app logic is unaffected.
- For long-running dev server sessions, use a tmux session (e.g. `nextjs-dev-server`) rather than a one-shot background shell.
