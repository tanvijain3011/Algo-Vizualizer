# Algo Visualizer

An interactive web app for visualizing classic algorithms and data structures, step by step — built to make the mechanics easy to *see*: comparisons, swaps, traversal order, and internal state are highlighted at every step.

## Features

- **Sorting** — Bubble, Selection, Insertion, Merge, Quick Sort
  - Animated bars with color-coded comparing / swapping / sorted states
  - Play / pause / step forward / step back / speed control
  - Complexity panel (best / average / worst time, space) per algorithm
- **Searching** — Linear Search, Binary Search
  - Highlights the element being checked, eliminated elements, and the found target
  - Binary Search auto-sorts the array and eliminates halves visually
- **Data Structures** — Stack, Queue, Linked List, Binary Search Tree
  - Interactive push/pop, enqueue/dequeue, head/tail insert/delete
  - BST with insert / delete / search and animated in-order, pre-order, post-order traversals
  - Operation log with costs (e.g. `push(x) — O(1)`)
- **Graph Traversal** — Breadth-First Search, Depth-First Search
  - Editable canvas: add / drag / delete nodes, add edges, or load presets
  - Live queue/stack state and traversal order panels

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 4, Framer Motion, Radix UI, wouter
- **Backend:** Node.js, Express 5, pino logging
- **API contracts:** OpenAPI spec → generated client (Orval) + Zod schemas
- **Tooling:** pnpm workspaces, TypeScript project references, esbuild

## Getting Started

Prerequisites: Node.js 20+, [pnpm](https://pnpm.io/) (`corepack enable`).

```bash
pnpm install

# run the frontend (http://localhost:5173)
pnpm --filter @workspace/dsa-visualizer run dev

# run the API server (http://localhost:5000, needs PORT env var)
pnpm --filter @workspace/api-server run dev
```

The API server exposes a health check at `GET /api/healthz`.

> On Replit, `PORT` and `BASE_PATH` are injected automatically. Locally, the frontend defaults to port 5173 and base path `/`.

## Scripts

| Command | Description |
|---|---|
| `pnpm run typecheck` | Typecheck all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/dsa-visualizer run build` | Production build of the frontend |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API client + Zod schemas from `openapi.yaml` |
| `pnpm --filter @workspace/db run push` | Push Drizzle DB schema (dev only, needs `DATABASE_URL`) |

## Project Structure

```
artifacts/
  dsa-visualizer/     # React frontend (visualizers, UI)
  api-server/         # Express API server
  mockup-sandbox/     # UI component sandbox
lib/
  api-spec/           # OpenAPI source of truth
  api-client-react/   # Generated typed React hooks
  api-zod/            # Generated Zod validation schemas
  db/                 # Drizzle ORM setup + schema
scripts/              # Workspace utility scripts
```

## License

MIT
