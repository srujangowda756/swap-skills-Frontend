# SwapSkills Frontend

SwapSkills is a peer-to-peer learning app where people exchange practical skills. This repository contains the React/Vite client only. The FastAPI backend lives in a separate repository and is reached through the URL configured by `VITE_API_URL`.

## What is included

- Responsive landing, authentication, dashboard, discovery, requests, inbox, and chat screens
- Skill profiles with teach and learn goals
- User discovery and swap requests
- Authenticated conversations and messaging
- Shared dark glass UI with accessible focus states, responsive layouts, and reduced-motion support

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A running SwapSkills API

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Environment

Create `.env.local` from `.env.example`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The API must allow requests from the Vite development origin through CORS. Do not commit `.env.local` or credentials.

## Scripts

| Command           | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

## Deploying

Build the frontend with `npm run build`, then deploy the generated `dist/` directory to a static host such as Vercel, Netlify, Cloudflare Pages, or GitHub Pages. Set `VITE_API_URL` in the host's build environment to the public backend URL and configure the backend CORS allowlist for the deployed frontend domain.

For client-side routing, configure the host to serve `index.html` for unknown paths so routes such as `/discover` and `/chat/:conversationId` work after a refresh.

## Repository split

This frontend repo intentionally does not contain the Python API, database migrations, or backend secrets. Keep backend setup, migrations, and deployment configuration in the backend repository.

## License

Add the project license before publishing the repository publicly.
