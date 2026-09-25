# Test Todo

A dark-themed, installable Todo PWA built with Next.js (App Router), shadcn/ui-style
components on top of Radix primitives, Tailwind CSS, and IndexedDB for fully local,
offline-first storage — nothing is sent to a server.

- 3-level navigation: **All todos → Category → Subcategory**
- Add/delete categories and subcategories, add/complete/delete todos with notes and priority
- All data lives in the browser's IndexedDB (`test-todo-db`), so it persists across reloads
  and works offline
- Installable on desktop and mobile (manifest + service worker + install prompt)
- Fully responsive: collapsible sheet sidebar on mobile, fixed sidebar on desktop

## Run it locally

You'll need Node.js 18.18+ (Node 20+ recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

> Note: this project's `package.json` pins current-generation versions of Next.js 15,
> React 19, Tailwind 3 and Radix UI. Because it was generated without network access,
> the exact dependency versions haven't been installed/build-verified in this sandbox —
> run `npm install && npm run build` locally once, and if anything needs a bump
> (`npm outdated`), it's a normal Next.js app underneath, so the fix is routine.

### Icons / favicon

`public/icons/*.png` and `public/manifest.webmanifest` are already generated
placeholder app icons (dark rounded square with a checklist mark). Swap them for your
own artwork any time — same file names, same sizes (16, 32, 180, 192, 512, and a
512 "maskable" version for Android's adaptive icon).

### PWA / install behavior

- `public/sw.js` is a small hand-written service worker (network-first for pages,
  cache-first for static assets) registered from `src/components/pwa/register-sw.tsx`.
- That same component listens for the `beforeinstallprompt` event and shows a small
  "Install Test Todo" card so users can add it to their home screen / desktop — this
  only works over **HTTPS** (or `localhost`), which Vercel gives you automatically.

## Push to GitHub

```bash
cd test-todo
git init
git add .
git commit -m "Initial commit: Test Todo PWA"
gh repo create test-todo --public --source=. --remote=origin --push
```

(No `gh` CLI? Create an empty repo named `test-todo` on github.com, then:)

```bash
git remote add origin https://github.com/<your-username>/test-todo.git
git branch -M main
git push -u origin main
```

## Deploy to Vercel

Easiest path, from the repo you just pushed:

```bash
npx vercel        # first deploy, follow the prompts
npx vercel --prod # promote to production
```

Or without the CLI: go to https://vercel.com/new, import the `test-todo` GitHub repo,
leave the defaults (Framework Preset: Next.js), and click **Deploy**. Every push to
`main` will auto-deploy after that.

Once deployed, visit the HTTPS URL on your phone or desktop Chrome/Edge — you'll get an
"Install" prompt (or use the in-app "Install Test Todo" banner) to add it as a real app.
