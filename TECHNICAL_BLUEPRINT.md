# Technical Blueprint: High-Performance Next.js Media Website V2
## 1. Core Architecture & Tech Stack
**Goal:** Build a blazing fast, SEO-optimized website for downloading Turkish Series (Video Content), replicating the success of our previous high-traffic Manga project.

### The Stack
- **Framework:** Next.js 15 (App Router).
- **Language:** TypeScript (Strict Mode).
- **Styling:** Tailwind CSS (Vanilla CSS for complex animations). **Avoid heavy UI libraries** like MUI or AntD.
- **Database:** Supabase (PostgreSQL).
- **Storage:** Cloudflare R2 (for large video files/downloads) + Cloudinary (for optimized cover images).
- **Deployment:** Vercel.

---

## 2. Performance & The "Lightweight" Secret
The previous project succeeded because we obsessed over payload size. Apply these strict rules:

### A. Image Optimization (Crucial)
1. **Format:** ALL static assets must be **WebP**.
2. **Component:** Always use `next/image`.
   - Use `placeholder="blur"` for local images.
   - Define exact `sizes` prop to prevent downloading desktop images on mobile.
3. **Lazy Loading:** Images below the fold must have `loading="lazy"`.
4. **Icons:** Use **`lucide-react`**. Do NOT import heavy SVG packs. Import specific icons only: `import { Search } from 'lucide-react'`.

### B. Caching Strategy
- Use `export const revalidate = 60` (ISR) for pages that don't change often (e.g., Homepage, Series Details).
- Use `export const revalidate = 0` (SSR) ONLY for user-specific pages (Bookmarks, Profile).

---

## 3. Database Strategy (Supabase) - "The Fast Way"
Do not let the frontend do heavy lifting. Move logic to the DB.

### A. Advanced Querying
- **Don't join 5 tables in the client.** Use **Postgres Functions (RPC)**.
- *Example:* Instead of fetching 1000 rows and filtering in JS, write an RPC `get_latest_episodes` that accepts pagination params (`limit`, `offset`) and returns exactly what is needed.

### B. Relationships
- When fetching a series, fetch its episodes count in the same query using generic count: `.select('*, episodes(count)')`.

---

## 4. Media Storage & Downloads (Project Specific)
Since this is for **Turkish Series (Video)**, the bandwidth usage is different from Manga.

1. **Cloudflare R2:** Store the actual video files here. It has **Zero Egress Fees**. Do NOT use AWS S3 (too expensive for downloads).
2. **Link Protection:** Don't expose the direct R2 bucket URL. Create a Next.js API route that generates a **Presigned URL** valid for 1 hour, or proxy the download through a worker if necessary to hide the source.

---

## 5. SEO Mastery (Google's Favorite)
The site must rank high. Implement this programmatically:

1. **Dynamic Metadata:** Every `page.tsx` must export `generateMetadata`.
   - Title: `[Series Name] Episode [X] Arabic Sub | [Site Name]`
   - Description: Auto-generated summary.
2. **Structured Data (JSON-LD):**
   - Use `VideoObject` schema for episode pages.
   - Use `TVSeries` schema for the main series page.
   - **BreadcrumbsList** is mandatory for site structure understanding.
3. **Semantic HTML:** Use `<article>`, `<section>`, `<h1>` (only one per page), `<time>`.

---

## 6. UI/UX & "Premium" Aesthetics
We want the site to feel expensive but load fast.

1. **Glassmorphism:** Use `backdrop-blur-md` and semi-transparent backgrounds (`bg-black/50`).
   - **WARNING:** Be careful with expensive blur filters on mobile. Disable blurs on low-end devices if possible.
2. **Z-Index Management:**
   - Define a `z-index` scale in Tailwind config or global CSS variables.
   - **Trap to Avoid:** Don't let background effects (blobs/gradients) cover clickable elements or the footer. Always set backgrounds to `z-0` or `pointer-events-none`.
3. **Skeleton Loading:** Never show a white screen. Create a `loading.tsx` for every route that mimics the layout.

---

## 7. Dashboard & Security (Lessons Learned)
1. **RLS (Row Level Security):** Enable it immediately in Supabase.
   - Policy: `public` can `SELECT`.
   - Policy: `admin` can `INSERT/UPDATE/DELETE`.
2. **Role Management:** Keep it simple. Add a `role` column to the `profiles` table. Don't overengineer permissions initially.

---

## 8. Common Pitfalls to AVOID (Experience Log)
1. **Hydration Errors:** Don't use `Date.now()` or `Math.random()` directly in the render body. Use `useEffect` or fixed seeds.
2. **Infinite Loops:** Watch out for `useEffect` dependency arrays when fetching data.
3. **Ghost Loading:** When filtering lists (e.g., search), ensure the old list disappears immediately or shows a loading state, otherwise, the user thinks the search failed.
4. **Vercel Timeouts:** Do NOT scrape or upload large files inside a Next.js API route. It has a 10s-60s limit. Use a separate Python script or a Background Worker for scraping/uploading.

**Instruction:** Read this blueprint carefully. It represents weeks of debugging and optimization. Use it as the "Constitution" for the new project.
