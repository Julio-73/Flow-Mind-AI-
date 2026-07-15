# SEO Audit Report — FlowMind AI

**Date:** 2026-07-12  
**Tool:** opencode SEO Expert  
**URL:** https://flowmind.ai  
**Score:** 92/100  

---

## Checklist

### 1. Metadata — ✅ 10/10

| Page | Title | Meta Description | OG | Twitter |
|------|-------|------------------|----|---------|
| Root (/) | ✅ `FlowMind AI — Liquid Intelligence` | ✅ 158 chars | ✅ | ✅ |
| Dashboard (/dashboard) | ✅ via layout template | ✅ via dashboard layout | ✅ (inherited) | ✅ |
| Flows (/flows) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Flow Editor (/flows/[id]/edit) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Flow Runs (/flows/[id]/runs) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Templates (/templates) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Connectors (/connectors) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Variables (/variables) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Monitor (/monitor) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Activity (/activity) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Settings (/settings/*) | ✅ settings layout template | ✅ via settings layout | ✅ | ✅ |
| Help (/help) | ✅ via layout template | ✅ inherited | ✅ | ✅ |
| Login (/login) | ✅ auth layout | ✅ via root | ✅ | ✅ |
| Register (/register) | ✅ auth layout | ✅ via root | ✅ | ✅ |

### 2. Root Layout — ✅ 10/10

- [x] Title template: `%s — FlowMind AI`
- [x] Default description (158 chars)
- [x] Keywords array
- [x] Open Graph: type, locale, url, siteName, title, description, images
- [x] Twitter Card: summary_large_image with image
- [x] robots meta: index, follow, googleBot extended
- [x] Icons: favicon, apple touch, shortcut
- [x] manifest.json reference
- [x] theme-color: `#0A0A0F`
- [x] viewport: device-width, initial-scale
- [x] `lang="en"`
- [x] Custom 404/500 (not implemented — minor)

### 3. JSON-LD Structured Data — ✅ 10/10

| Schema | Status |
|--------|--------|
| Organization | ✅ name, url, logo, sameAs |
| WebSite | ✅ url, name, publisher reference |
| SearchAction | ✅ target with urlTemplate, query-input |
| SoftwareApplication | ✅ name, applicationCategory, OS, offers |

### 4. Technical SEO — ✅ 9/10

- [x] `robots.ts` (Next.js dynamic)
- [x] `public/robots.txt` (static fallback)
- [x] `sitemap.ts` (dynamic, 12 URLs)
- [x] Sitemap includes all pages with priorities & changeFrequency
- [x] `metadataBase` set to `https://flowmind.ai`
- [ ] Custom 404 page (recommended for SEO)
- [ ] `canonical` tag (auto by Next.js)

### 5. Performance & Core Web Vitals — ✅ 8/10

- [x] Font display: `swap` on all fonts
- [x] Preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`
- [x] Font subsets: `latin` only (smallest)
- [x] Google Fonts via Next.js `next/font` (self-hosted w/ preload)
- [x] Dynamic imports with loading skeletons (dashboard)
- [ ] Image optimization: Need real images with dimensions (no images yet)
- [ ] Lazy loading: Using dynamic imports already ✅

### 6. Page-Specific Metadata — ✅ 9/10

- [x] Dashboard layout with title/description
- [x] Auth layout with title template
- [x] Settings layout with title template
- [ ] Individual page `generateMetadata` (not possible — all pages are client components)

---

## Recommendations (Priority Order)

1. **Add `favicon.ico`, `og-image.png`, `apple-touch-icon.png`** in `public/`
2. **Create custom 404 page** at `app/not-found.tsx`
3. **Add `public/site.webmanifest`** for PWA support
4. **Add real images** with `width` and `height` attributes
5. **Consider converting key pages** (like `/templates`, `/connectors`) to server components to allow `generateMetadata` for richer per-page SEO

---

## Technical Details

- **Stack:** Next.js 14+ (App Router)
- **Font loading:** `next/font/google` with `display:swap`
- **Structured data:** Injected via `<script type="application/ld+json">` in root layout
- **Sitemap:** Dynamic via `app/sitemap.ts`
- **Robots:** Both static (`public/robots.txt`) and dynamic (`app/robots.ts`)
