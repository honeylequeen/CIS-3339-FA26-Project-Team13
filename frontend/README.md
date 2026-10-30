# Data Platform Frontend

This project uses [VueJS 3](https://vuejs.org/) (Composition API) with [Vite](https://vitejs.dev/) and [TailwindCSS](https://tailwindcss.com/).
For form validation [Vuelidate](https://vuelidate-next.netlify.app/) is used.

State management is done via [Pinia](https://pinia.vuejs.org/).

## Requirements

- Node.js **18 or newer** (tested with Node 20 and 22). Check with `node -v`.
- npm (comes with Node.js)

## Project setup

From the `frontend` folder:

    npm install

## Environment variables

The frontend reads its settings from `frontend/.env` (committed to the repo for grading):

    VITE_ROOT_API=http://localhost:3000

| Variable | What it does |
| --- | --- |
| `VITE_ROOT_API` | The full URL of the backend API. Every API call in `src/api/api.js` is sent to this address. Use `http://localhost:3000` for a local backend, or the deployed backend's URL (e.g. `https://your-backend.onrender.com`) in production. |

Vite copies `VITE_` variables into the code **when it builds**, so:

- After changing `.env`, restart `npm run dev`.
- For a production build, `VITE_ROOT_API` must be set *before* `npm run build` (locally in `.env`, or as an environment variable on the hosting service).

There is no hard-coded backend address anywhere in `src/`. If `VITE_ROOT_API` is missing, the browser console shows a warning and API calls fail with "Unable to reach the server".

## Development

Start the backend first (see `backend/README.md`), then:

    npm run dev

Open http://localhost:5173. The dev server hot-reloads when you save a file.

## Production build

Build the static site into `frontend/dist`:

    npm run build

The command must finish without errors (exit code 0). Then serve the production build locally to check it:

    npm run serve

Open http://localhost:4173. This serves the files from `dist/` exactly as a static host would, so test here (not on the dev server) before deploying or recording a demo.

`dist/` is build output and is ignored by git. Never commit it.

## Page refresh on nested routes (SPA fallback)

The app uses Vue Router's HTML5 history mode, so URLs look like `/clientdetails/123`. That path is not a real file on the server: only `index.html` exists. Without extra setup, refreshing or opening that URL directly on a static host returns **404 Not Found**.

The fix is an SPA fallback: the host must serve `index.html` for any path that isn't a real file, and Vue Router then shows the right page.

- **Netlify** (what we use): handled by `frontend/public/_redirects`, which `npm run build` copies into `dist/`:

      /*    /index.html   200

- **`npm run serve`** (local preview): Vite already does this, so no setup is needed.
- **Other hosts**: add the equivalent rewrite rule, e.g. Render static site → *Redirects/Rewrites*: Source `/*`, Destination `/index.html`, Action **Rewrite**.

To test: run `npm run serve`, log in, open a client, then press **F5** on `/clientdetails/<id>`. The page should reload, not show a 404.

## Deploying to Netlify

The repo's root `netlify.toml` holds the build settings (base folder `frontend`, command `npm run build`, publish folder `dist`, Node 20).

1. Sign in at [netlify.com](https://www.netlify.com) with GitHub.
2. **Add new site → Import an existing project → GitHub**, then choose this repository. Netlify reads the build settings from `netlify.toml`, so leave them as they are.
3. Under **Site configuration → Environment variables**, add `VITE_ROOT_API` = your deployed backend's URL (no trailing slash).
4. Click **Deploy**. The site URL looks like `https://<name>.netlify.app`.
5. After changing `VITE_ROOT_API`, trigger a new deploy (**Deploys → Trigger deploy**), because the value is baked in at build time.

### Connecting to the deployed backend (CORS)

The browser only lets the frontend call the backend if the backend allows the frontend's origin. On the backend, set `CORS_ORIGIN` to the exact frontend URL, for example:

    CORS_ORIGIN=https://<name>.netlify.app

No trailing slash, and it must match the protocol (`https`). For local development it stays `http://localhost:5173`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Lists show "Unable to reach the server" | The backend isn't running, `VITE_ROOT_API` is wrong, or CORS is blocking the request (check the browser console). |
| 404 when refreshing a page on the deployed site | `_redirects` didn't make it into `dist/`. Check that `frontend/public/_redirects` exists and rebuild. |
| Changed `.env` but nothing changed | Restart `npm run dev`, or rebuild with `npm run build`. |
