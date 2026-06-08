# Website Changelog

## 2026-06-03 - Standalone SEO worker repair

- Updated Worker asset lookup to avoid directory-index redirect loops for sitemap URLs.
- Removed checkout from dynamic sitemap output while keeping checkout pages available for users.
- Expanded the Worker SEO allowlist to include sitemap-listed keyword landing pages where applicable.
- Deployment: pending per-site Worker deploy and live recheck.

## 2026-06-08 16:06:51 CST - SEO/GEO + Build Checklist Repair

Scope: repaired P0/P1 checklist issues for insforge.space.

Touched files:
  - InsForge/dist/index.html
  - InsForge/dist/pricing/index.html
  - InsForge/dist/robots.txt

Verification: ran the shared SEO/GEO patrol fixer from the latest all-sites checklist input; 9router build also passed after shared route guard changes.

Deploy/Git status: pending commit, push, deploy, and post-deploy checklist rerun.

Follow-ups: re-run the all-sites SEO/GEO + build checklist after production deployment and keep any DNS/account-only blockers in the issue ledger.
