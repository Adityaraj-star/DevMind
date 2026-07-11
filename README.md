<div align="center">

# DevMind

**Visual Code Architecture Explorer**

Paste code or drop a GitHub URL. DevMind maps every file, import, and dependency into an interactive, force-directed graph, entirely in your browser.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![D3.js](https://img.shields.io/badge/D3.js-7-f9a03c?logo=d3.js&logoColor=white)](https://d3js.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)

[Live Demo](https://dev-mind-peach.vercel.app) &nbsp;·&nbsp; [Report a Bug](#) &nbsp;·&nbsp; [Roadmap](#roadmap--future-work)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [How It Works](#how-it-works)
- [Key Technical Decisions](#key-technical-decisions)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Roadmap / Future Work](#roadmap--future-work)
- [Contributing](#contributing)
- [Author](#author)

---

## Overview

DevMind is a client-side tool that turns a codebase into something you can actually look at. Instead of clicking through folders one file at a time, you either paste raw JavaScript/TypeScript code or point DevMind at a public GitHub repository, and it builds a live, force-directed dependency graph showing every file as a node and every import as a connection.

The entire analysis pipeline (fetching, parsing, graph construction, and rendering) runs in the browser. Nothing is uploaded to a server, nothing requires an account, and every past analysis is saved locally so you can come back to it later.

The project started as a portfolio piece to demonstrate real frontend engineering depth: custom state management, a hand-rolled parser, a D3 force simulation wired into React's render cycle, and a full GitHub REST API integration with rate limit handling, all without relying on a heavy framework or a backend.

---

## Features

**Two ways to bring in code**
- Paste code directly into an in-browser editor, with drag-and-drop file support
- Paste multiple files at once using a simple `// --- file: name.tsx ---` delimiter, and DevMind will graph the relationships between them
- Or paste a public GitHub repository URL and DevMind fetches the real file tree and file contents directly from GitHub

**GitHub integration**
- Resolves the repository's default branch automatically, or lets you specify one
- Recursively fetches the full file tree in a single API call
- Filters out irrelevant files (`node_modules`, `dist`, `.git`, test files, type declaration files, etc.) and keeps only `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, and `.cjs` files
- Downloads file contents in small concurrent batches to stay within rate limits
- Optional personal access token support, stored only in `localStorage`, to raise the GitHub API limit from 60 requests/hour to 5,000 requests/hour
- Typed, specific error states for every failure mode: invalid URL, repo not found, rate limited, empty repo, network error

**Interactive graph visualization**
- Force-directed layout built on D3's physics simulation (charge, link, center, and collision forces)
- Drag any node to reposition it, with the simulation reacting in real time
- Zoom and pan with mouse wheel or the on-screen controls, plus a reset-to-fit button
- Click a node to see its file details, connections, and highlight everything it touches
- Filter the graph by file type (component, hook, util, config)
- Node size scales with lines of code, so larger files are visually heavier
- A legend explains the color coding for each file type

**File detail panel**
- Full list of a file's imports and exports
- Incoming connections (who imports this file) and outgoing connections (what this file imports)
- Distinguishes internal, relative imports from external package imports

**History and persistence**
- Every analysis (pasted or GitHub) is saved to `localStorage` and appears in a searchable sidebar
- Revisit any past analysis without re-fetching or re-parsing anything
- Delete individual analyses from history

**Resilience and polish**
- Component-level error boundaries so a rendering bug in the graph doesn't take down the whole page
- Loading states for every async operation (resolving repo, listing files, fetching contents, parsing)
- Dark/light theme toggle backed by global state and persisted across sessions
- Fully keyboard-accessible controls with proper ARIA labeling throughout

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| UI framework | React 19 | Component model, hooks, Suspense for route-level code splitting |
| Language | TypeScript | End-to-end type safety, especially around the parser's output and the D3 data structures |
| Styling | Tailwind CSS v4 | Utility-first styling with the new CSS-based config and Vite plugin, no separate config file needed |
| Routing | React Router v7 | Client-side routing with lazy-loaded route components |
| Forms | React Hook Form | Uncontrolled form state and validation for the GitHub URL form |
| Graph engine | D3.js v7 (force, zoom, selection) | Industry-standard force simulation and zoom/pan behavior, wired manually into React rather than through a wrapper library |
| Build tool | Vite 8 | Fast dev server and optimized production builds with manual chunking |
| Deployment | Vercel | Static hosting with SPA rewrites and asset caching |
| Data persistence | Browser `localStorage` | No backend; theme, analysis history, and GitHub token all live client-side |

No backend, no database, and no external services besides the public GitHub REST API. Everything else runs entirely in the user's browser.

---

## Project Architecture

### Folder structure

```
src/
├── components/
│   ├── github/
│   │   ├── GitHubTokenInput.tsx       # Collapsible PAT input + rate limit display
│   │   ├── GitHubFetchProgress.tsx    # Phase-based progress UI while fetching a repo
│   │   └── GitHubFetchErrorView.tsx   # Typed, per-error-type failure screens
│   ├── graph/
│   │   ├── GraphCanvas.tsx            # SVG canvas, D3 force simulation, drag/zoom logic
│   │   ├── GraphStatsBar.tsx          # File/line counts + type filters
│   │   ├── GraphLegend.tsx            # Color legend for node types
│   │   └── NodeInfoPanel.tsx          # Slide-in panel with file details
│   ├── layout/
│   │   ├── Navbar.tsx                 # Top nav, theme toggle, sidebar toggle
│   │   ├── Sidebar.tsx                # Searchable analysis history drawer
│   │   ├── PageShell.tsx              # Shared page frame (nav + sidebar + content)
│   │   ├── HeroSection.tsx            # Landing page hero
│   │   ├── FeatureCards.tsx           # Landing page feature showcase
│   │   └── CodePastePanel.tsx         # Paste/drag-and-drop code editor
│   ├── ui/
│   │   ├── Button.tsx                 # Variant-based button (primary/secondary/ghost/danger)
│   │   ├── Badge.tsx                  # Small labeled tag, typed by file/status variant
│   │   └── Input.tsx                  # Labeled input with error/hint support
│   └── ErrorBoundary.tsx              # Class component catching render errors per-section
├── context/
│   └── AppContext.tsx                 # Global state provider (useReducer + Context)
├── hooks/
│   ├── useDebounce.ts                 # Generic debounce hook (sidebar search)
│   ├── useGitHubToken.ts              # PAT persistence + rate limit tracking
│   ├── useGraphEngine.ts              # D3 force simulation lifecycle, exposed to React
│   ├── useZoom.ts                     # D3 zoom/pan behavior, exposed to React
│   └── useTheme.ts                    # Thin wrapper around theme state
├── lib/
│   ├── github.ts                      # GitHub REST API client (tree, contents, rate limits)
│   ├── parser.ts                      # Regex-based import/export parser + graph builder
│   ├── reducer.ts                     # App reducer + localStorage read/write
│   └── utils.ts                       # cn(), formatting, URL helpers, id generation
├── pages/
│   ├── Home.tsx                       # Landing page
│   ├── Analyze.tsx                    # Paste-code / GitHub-URL input page
│   ├── AnalysisDetail.tsx             # The graph viewer for a single analysis
│   └── NotFound.tsx                   # 404 page
├── types/
│   └── index.ts                       # All shared TypeScript types
├── App.tsx                            # Router, providers, lazy route definitions
└── main.tsx                           # Entry point, pre-hydration theme application
```

### State management

DevMind uses a single global store built from React's `useContext` and `useReducer`, defined in `AppContext.tsx` and `reducer.ts`. There is no Redux, Zustand, or any external state library.

The store holds:
- `theme`: `"dark" | "light"`, persisted to `localStorage` under `devmind-theme`
- `analyses`: the full list of saved `AnalysisRecord` objects, persisted under `devmind-analyses`
- `activeAnalysisId`: which analysis is currently open
- `sidebarOpen`: history drawer visibility
- `currentStatus` and `errorMessage`: shared status for in-flight operations

Every action that changes saved data (`ADD_ANALYSIS`, `DELETE_ANALYSIS`, `UPDATE_ANALYSIS`) writes straight through to `localStorage` inside the reducer, so the in-memory state and persisted state never drift apart.

A `useEffect` inside `AppProvider` toggles the `dark` class on `document.documentElement` whenever `theme` changes, which is what Tailwind's dark mode variant hooks into. `main.tsx` also applies the saved theme synchronously before React mounts, to avoid a flash of the wrong theme on page load.

### Routing

`App.tsx` sets up four routes with `react-router-dom`, each lazy-loaded with `React.lazy` and wrapped in a `Suspense` boundary:

- `/` -> `Home`
- `/analyze` -> `Analyze`
- `/analysis/:id` -> `AnalysisDetail`
- `*` -> `NotFound`

The whole route tree sits inside a top-level `ErrorBoundary`, so an unexpected error on any page shows a recoverable fallback instead of a blank screen.

### The graph engine

Two hooks bridge D3 (which is imperative and mutates a plain array of objects) with React (which is declarative and re-renders from state):

- **`useGraphEngine`**: creates and owns a `d3.forceSimulation`, clones the incoming graph data so D3 can safely mutate node positions, and schedules a React re-render on every simulation tick using `requestAnimationFrame` (to avoid flooding React with updates faster than the browser can paint). It also exposes `dragNode` and `releaseNode`, which pin (`fx`/`fy`) or release a node when the user drags it.
- **`useZoom`**: creates a `d3.zoom` behavior bound to the SVG element and syncs the resulting transform (`x`, `y`, `k`) into React state, which `GraphCanvas` applies via an SVG `<g transform="...">`.

`GraphCanvas.tsx` renders nodes and links as memoized subcomponents (`GraphNodeItem`, `GraphLinkItem`) with custom equality checks, so only the nodes that actually moved re-render on each simulation tick, not the entire graph.

---

## How It Works

### Workflow 1: Pasting code

1. User pastes or drops one or more files into `CodePastePanel`.
2. On submit, `parsePastedCode()` in `parser.ts` splits the input on `// --- file: name ---` delimiters (or treats it as a single file if none are found).
3. Each file is run through `parseCode()`, which uses regular expressions to extract:
   - ES module imports (`import ... from '...'`) and CommonJS `require()` calls
   - Named exports, default exports, and `export { a, b as c }` blocks
   - Line count and a file "type" (component, hook, util, or config), inferred from the filename and casing
4. `buildGraphData()` turns the parsed files into `GraphNode` and `GraphLink` objects, resolving relative imports (`./`, `../`) against the other files in the same paste to form edges. External package imports are ignored for the graph (they'd all point outside the analyzed set).
5. The resulting `AnalysisRecord` is saved to global state (and therefore `localStorage`) and the user is routed to `/analysis/:id`.

### Workflow 2: Analyzing a GitHub repository

1. User enters a GitHub URL (validated with React Hook Form) and an optional branch.
2. `parseGitHubUrl()` extracts the owner, repo, branch, and subpath from the URL.
3. On the analysis page, `fetchGitHubRepo()` in `github.ts` runs the full pipeline:
   - Resolves the default branch if none was given
   - Fetches the entire file tree recursively in one request (`GET /repos/:owner/:repo/git/trees/:branch?recursive=1`)
   - Filters the tree down to relevant source files, excluding build output, dependencies, tests, and declaration files, and caps the result at 60 files (closest to the project root first) to keep the graph readable
   - Downloads each file's raw contents from `raw.githubusercontent.com` in batches of 8 concurrent requests
   - Reports progress at every phase (resolving, listing, fetching, parsing) back to the UI via callbacks
4. GitHub's rate limit headers are read on every request. If a personal access token has been saved (via `useGitHubToken`), it's attached as a Bearer token, raising the limit from 60 to 5,000 requests/hour.
5. Once all files are downloaded, the same `buildGraphData()` pipeline used for pasted code turns them into a graph.
6. The graph, file count, and raw file contents are saved back onto the `AnalysisRecord` so revisiting the analysis later doesn't require re-fetching from GitHub.

### Workflow 3: Viewing and exploring a graph

1. `AnalysisDetail` looks up the analysis by `id` from global state.
2. If the analysis already has cached `graphData`, it renders immediately. Otherwise it kicks off the GitHub fetch pipeline above.
3. `GraphCanvas` hands the graph data to `useGraphEngine`, which starts the D3 simulation and settles the layout over a couple of seconds.
4. Clicking a node selects it, dims unrelated nodes, highlights its direct connections, and slides in `NodeInfoPanel` with its imports, exports, and connection counts.
5. The stats bar lets the user filter the graph down to a single file type, recomputing which nodes and links are visible without restarting the simulation.

---

## Key Technical Decisions

**Regex-based parsing instead of a full AST parser.** DevMind extracts imports and exports with targeted regular expressions rather than a JavaScript/TypeScript AST library (like Babel or the TypeScript compiler API). This keeps the bundle small and the parsing instant, at the cost of not handling every possible syntax edge case perfectly. For the purpose of mapping architecture at a glance, this tradeoff favors speed and simplicity.

**Client-side only, no backend.** Every fetch, parse, and graph computation happens in the browser. This keeps the project free to run and deploy, keeps user code and GitHub tokens off any server, and was a deliberate constraint to prove out a fully client-driven architecture.

**D3 for physics, React for rendering.** Rather than reaching for a pre-built graph visualization library, the force simulation and zoom behavior are D3 primitives wired directly into React state through custom hooks. This was the most technically involved part of the project and the main reason it exists: to demonstrate integrating an imperative, mutation-heavy library cleanly with React's render model.

**`useReducer` + `Context` over a state management library.** The app's global state is small and well-defined enough (theme, analysis history, one or two UI flags) that a reducer and Context cover it without pulling in Redux or Zustand.

**GitHub token stored client-side only.** The optional personal access token is kept exclusively in `localStorage` and sent only to `api.github.com`. It is scoped to public read-only access and never touches any DevMind-controlled server, because there isn't one.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
git clone https://github.com/Adityaraj-star/devmind.git
cd devmind
npm install
```

### Running locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for production

```bash
npm run build
```

This runs a TypeScript project build (`tsc -b`) followed by the Vite production build, and outputs static files to `dist/`.

### Previewing the production build

```bash
npm run preview
```

No environment variables or API keys are required to run DevMind locally. GitHub API access works unauthenticated out of the box, just with a lower rate limit.

---

## Available Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server with hot module reloading |
| `npm run build` | Type-checks the project and builds an optimized production bundle |
| `npm run lint` | Runs ESLint across the codebase |
| `npm run preview` | Serves the production build locally for a final check before deploying |

---

## Deployment

DevMind is deployed on Vercel as a static single-page app. `vercel.json` handles two things:

- Rewriting every route back to `index.html` so client-side routing (`/analysis/:id`, etc.) works correctly on direct page loads and refreshes
- Setting long-lived, immutable cache headers on hashed assets in `/assets`, while keeping HTML files revalidated on every request

The Vite build config also manually splits vendor code into separate chunks (`react-vendor`, `d3-vendor`, `form-vendor`) so that updates to app code don't invalidate the cache for large, rarely-changing dependencies.

---

## Known Limitations

- Import/export extraction is regex-based, so unusual syntax (dynamic imports, re-exports through complex barrel patterns, decorators) may not be captured perfectly.
- Only `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, and `.cjs` files are analyzed. Other languages are not supported.
- GitHub repositories are capped at 60 analyzed files (the ones closest to the project root), so very large repos will show a partial picture of the architecture rather than the whole thing.
- All data lives in the browser's `localStorage`, so history does not sync across devices or browsers, and clearing site data clears saved analyses.
- The GitHub integration only supports public repositories.

---

## Roadmap / Future Work

- **AI-powered file explanations.** The node detail panel already has a placeholder for this: clicking a file will eventually send its source to an LLM and stream back a plain-language explanation of what it does and how it fits into the architecture, using a bring-your-own-API-key model so no server-side key handling is required.
- **AI refactor suggestions and diffs.** Surfacing code smells and generating side-by-side before/after suggestions for a selected file.
- **Circular dependency detection.** Highlighting cycles in the import graph directly on the canvas.
- **Complexity scoring.** A lightweight per-file complexity metric layered onto the existing node size/color encoding.
- **Git history time-travel.** Letting a user scrub through past commits of a GitHub repo and watch the dependency graph evolve over time.
- **AST-based parsing.** Replacing the regex parser with a proper TypeScript/Babel AST pass for more accurate import/export resolution on complex codebases.
- **Multi-language support.** Extending analysis beyond JavaScript and TypeScript.
- **Automated tests.** Unit tests for the parser and graph builder, and component tests for the graph interactions.
- **Shareable analyses.** Generating a shareable link or export for a completed analysis instead of keeping it local-only.

---

## Contributing

This is currently a solo portfolio project, but issues and suggestions are welcome. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request describing what you changed and why

---

## Author

**Aditya Raj**
