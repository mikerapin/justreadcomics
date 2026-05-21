# Memory Index

## Active work (as of 2026-05-21)

Dep upgrade + vuln reduction in progress on `v2`. `package.json` and `packages/client/package.json` have uncommitted changes from this session. Vuln count was 15 before this session — update `project_vuln_backlog.md` with new count after committing.

## Memory files

- [Security & Code-Quality Audit — Batch Processing Queue](security-audit-batches.md) — 4 prioritized batches (CRITICAL → HIGH → MEDIUM/LOW) covering credential exposure, hardening middleware, pattern modernization, and code quality. **All 4 batches complete as of 2026-05-19.**
- [Security Audit Complete — Constraints & Deferred Risks](project_security_audit_done.md) — env var requirements, CORS/MASS_IMPORT_KEY caller changes, cheerio pin constraint, deferred httpOnly cookie migration, and NOT IMPLEMENTED scraper stubs.
- [npm Vulnerability Backlog — 15 remaining pre-2026-05-21](project_vuln_backlog.md) — post-Vite-migration vulns: Vite 6.5+, react-router-dom, @typescript-eslint, sort-by, puppeteer. Ordered by upgrade risk.
- [CRA→Vite Migration Complete](project_client_vite_migration.md) — toolchain facts (entry HTML location, env var API, test runner), coverage threshold rationale, jsdom pin, eslintrc.js gotcha.
