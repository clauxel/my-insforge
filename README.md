# InsForge

Conversion-focused SaaS site for `insforge.space`.

## What is included

- Homepage-first InsForge planner that maps product shape to the likely backend stack.
- Useful inner pages for `InsForge github`, `InsForge AI`, `InsForge vs Supabase`, `InsForge YC`, `InsForge founder`, `InsForge dev`, `InsForge docs`, and `InsForge pricing`.
- Creem hosted checkout in a centered popup with blurred background, Pro annual selected by default, and homepage return after payment success.
- Cloudflare Worker + Assets setup for the live domain and Cloudflare Pages support for preview deployments.
- Static prerender output, route-level SEO, robots, and sitemap generation.
- First-party analytics events for page views, planner changes, CTA clicks, and checkout flow monitoring.

## Commands

```bash
npm install
npm run build
npx wrangler deploy --keep-vars
```
