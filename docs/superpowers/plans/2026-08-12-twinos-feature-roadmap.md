# TwinOS Feature Roadmap

> **Note on format:** This is a *sequencing roadmap* across 19 independent features, not a single bite-sized TDD implementation plan — per the writing-plans skill's own scope-check rule, a spec covering multiple independent subsystems should be broken into separate plans rather than forced into one. **Before implementing any phase below, that phase gets its own dedicated writing-plans pass** (bite-sized steps, real code, TDD) written at the time it's picked up — this document exists to decide *what order* and *what each thing actually requires*, not to be executed directly.

**Goal:** Sequence 19 brainstormed features into phases based on dependencies, new-infrastructure needs, new-schema needs, and risk — so implementation work can be scoped feature-by-feature with a full picture of what precedes what.

**Context:** TwinOS (Next.js 16 / Prisma 7 / Clerk, multi-tenant SaaS business simulation platform). Earlier this session we found and fixed a cluster of cross-tenant authorization bugs: client-trusted `businessId` on create/read routes, a missing ownership check on `GET /api/scenarios`, and a fail-open path where a Clerk error silently granted demo-mode trust in production. `verifyBusinessOwnership()` in `lib/auth-helpers.ts` is now the established pattern every new tenant-scoped route must use. Several features below add new CRUD surfaces or a new permission model entirely — those are flagged explicitly.

**Today's infrastructure gaps** (nothing in the codebase does any of this yet — every feature that needs it is flagged below):
- No background/scheduled jobs of any kind (candidate: Vercel Cron, since the app already deploys there).
- No outbound notification delivery (email/SMS) — only in-app `sonner` toasts exist client-side.
- No historical/time-series transaction storage — integration syncs overwrite current snapshot fields (`baselineRevenue`, etc.) or upsert current Product/Employee rows; nothing is ever stored per-period.
- No team/multi-user-per-business concept — `Business.ownerId` is a single user; `verifyBusinessOwnership` is strictly single-owner.

---

## Phase 1 — Self-contained, no new infrastructure, no new schema risk

These touch only `lib/simulation-engine.ts`, existing routes, and UI. No migrations beyond maybe one additive column. No new authorization surface.

### 1a. Industry-based elasticity/seasonality defaults
**Do this first** — several other features touch the same function signature, so establishing the shape early avoids repeated churn.
- **Problem:** `lib/simulation-engine.ts` hardcodes price elasticity (`-0.45`), marketing elasticity (`0.1`), and seasonal factor arrays identically for every business. `Business.industry` is stored (`prisma/schema.prisma:22`) but never read by the engine.
- **Approach:** Add a static lookup (`lib/industry-profiles.ts`): `industry → { priceElasticity, marketingElasticity, seasonalFactors }`, with a default profile for unknown/null industry (preserves current behavior exactly for existing data). Thread `business.industry` into `runSimulation()`'s `BaselineMetrics`.
- **Schema:** None.
- **Infra:** None.
- **Touches:** `lib/simulation-engine.ts`, `app/api/scenarios/run/route.ts`, `app/api/scenarios/optimize/route.ts`, `app/results/page.tsx` and `app/share/[id]/page.tsx` (both call `runSimulation` client-side for horizon switching — need `business.industry` added to those API responses too).
- **Risk:** Low. Pure function change; existing 61-test suite already exercises `runSimulation` heavily and will catch regressions.

### 1b. Vertical starter templates
Pairs naturally with 1a — both keyed off `industry`.
- **Approach:** Static config (`lib/scenario-templates.ts`): `industry → { name, priceIncrease, employeeCount, marketingBudget, supplierDelay }[]`. Scenario builder UI offers these as one-click starting points instead of a blank form.
- **Schema/Infra:** None.
- **Risk:** Low.

### 1c. Confidence bands / sensitivity view
- **Approach:** `runSimulation` is already pure and cheap — a sensitivity grid is just calling it N times with perturbed inputs (± a range around the elasticity assumption from 1a) and taking min/max per period. New lightweight route or extend `scenarios/run` response with a `sensitivity` block. New chart component (range band or small heatmap) using the existing Recharts dependency.
- **Schema:** None (optionally cache grids in DynamoDB via the existing `cacheForecast` helper in `lib/dynamodb.ts` — reuse, don't build new).
- **Infra:** None.
- **Depends on:** 1a (need a real elasticity value to perturb around).
- **Risk:** Low.

### 1d. "Explain this number" formula trace
- **Approach:** `runSimulation` currently returns only final rounded values. Extend `MonthlyProjection`/`SimulationOutput` to also carry the intermediate values already computed internally (`priceMultiplier`, `demandMultiplier`, `seasonalFactor` per period) instead of discarding them. UI: click any headline number → popover showing the formula with the actual numbers substituted in.
- **Schema/Infra:** None.
- **Depends on:** 1a, 1c (land after the engine's output shape settles from those two, so this isn't rebuilt twice).
- **Risk:** Low.

### 1e. Editable/overridable assumptions
- **Approach:** Let a user override the elasticity value 1a would otherwise pick. Small additive nullable columns on `Scenario` (or one JSON column, matching the `monthlyDataJson` convention already used on `SimulationResult`) for override values; engine prefers override over the industry-default lookup when present.
- **Schema:** One additive migration (nullable columns, non-breaking).
- **Depends on:** 1a.
- **Risk:** Low-Medium.

### 1f. Scenario version history / diffing
- **Approach:** Cheaper than it sounds — `SimulationResult` already stores every run's outputs with `generatedAt`, ordered newest-first (`app/api/scenarios/[id]/results/route.ts`). A v1 diff view just needs a UI over the existing `simulationResults` list already included in that query. The one gap: re-running a scenario currently overwrites the *input* fields in place on the same `Scenario` row (`prisma.scenario.update` in `scenarios/run/route.ts`), so prior inputs are lost — add an `inputsSnapshotJson` column to `SimulationResult` (same pattern as `monthlyDataJson`) captured at each run, so both inputs and outputs are diffable across runs.
- **Schema:** One additive column on `SimulationResult`.
- **Infra:** None.
- **Risk:** Low.

### 1g. Crisis mode
- **Approach:** Mostly UX/product framing, not new math — a distinct fast-entry flow (pre-filled "supplier collapsed" / "demand cratered" scenario shapes) reusing 1b's template mechanism with different copy and a simplified single-screen layout instead of the full scenario builder.
- **Schema/Infra:** None.
- **Depends on:** 1b (reuses the template mechanism).
- **Risk:** Low.

---

## Phase 2 — New schema, still no new infrastructure

Each of these needs a migration but nothing beyond Prisma + existing routes.

### 2a. Per-product/SKU pricing scenarios + real inventory planning
**Bundled deliberately** — both extend `Product`, so they share one migration instead of two.
- **Problem (pricing):** `Scenario.priceIncrease` is one blanket % across all revenue. Product has `price`/`cost` individually but no volume, so "this product's share of revenue" isn't derivable yet.
- **Problem (inventory):** `projectedInventoryRisk` is a single 0–1 score; no per-SKU reorder point or stock-on-hand.
- **Approach:** Add `Product.unitsSoldPerMonth`, `Product.unitsInStock`, `Product.reorderPoint`, `Product.leadTimeDays` (all additive, nullable/defaulted). New join table `ScenarioProductAdjustment { id, scenarioId, productId, priceIncrease }` (FK'd to Product with `onDelete: Cascade`, unlike the role-count case below — products are real entities that can be deleted, so a JSON blob referencing a stale product ID would be fragile here). Revenue model in `lib/simulation-engine.ts` needs a real decomposition path: per-product revenue = `price × unitsSoldPerMonth`, summed, instead of one scalar `baselineRevenue`.
- **Schema:** Migration: 4 new Product columns + 1 new table.
- **Infra:** None.
- **Risk:** Medium — this is a genuine engine redesign (moving from scalar to per-product revenue), bigger than it looks at first glance. Budget real design time, not just a quick patch.
- **Touches:** `prisma/schema.prisma`, `lib/simulation-engine.ts` (significant), `app/api/products/route.ts`, scenario builder UI, results pages.

### 2b. Role-level hiring/firing scenarios
- **Approach:** `Employee.role`/`department` already exist. Add a JSON column on `Scenario` (`roleTargetsJson`, mirroring `monthlyDataJson`'s convention) rather than a join table — roles here are free-text strings, not FK'd entities like Products, so a lightweight JSON blob is the better fit (reuse the existing pattern rather than inventing a heavier one). Engine computes payroll per role using each role's actual average salary instead of one blended average across all employees.
- **Schema:** One additive JSON column on `Scenario`.
- **Infra:** None.
- **Depends on:** Loosely on 1a/1e (same area of the engine signature).
- **Risk:** Medium.

### 2c. Cash-flow / runway view
- **Approach:** New `lib/cashflow-engine.ts` alongside the existing `simulation-engine.ts` (same file-per-concern pattern already used for `lib/dynamodb.ts`, `lib/encryption.ts`, etc.). Needs new baseline assumptions: `Business.averageReceivableDays`, `Business.averagePayableDays`, `Business.cashOnHand`.
- **Schema:** 3 additive columns on `Business`.
- **Infra:** None.
- **Risk:** Medium. Independent of the rest of Phase 2 — can run in parallel.

### 2d. Predicted-vs-actual tracking
**Should land before Phase 3's drift watch (3d) — that feature consumes this data.**
- **Approach:** Add `actualRevenue`, `actualProfit` (nullable) to `SimulationResult`. When a business's integration sync runs (`shopify/sync`, `square/sync`, `quickbooks/sync` — already fixed for ownership this session), check for any `SimulationResult` whose projection period has now passed and backfill the actual figures from the freshly-synced `business.baselineRevenue`/computed profit.
- **Schema:** 2 additive nullable columns on `SimulationResult`.
- **Infra:** None (piggybacks on existing sync routes).
- **Risk:** Low-Medium.

### 2e. Comments/annotations on scenarios
- **New model:** `ScenarioComment { id, scenarioId, authorEmail, body, createdAt }`.
- **⚠ Authorization flag:** New CRUD surface. Must use `verifyBusinessOwnership(scenario.businessId)` on create/delete from the very first commit — this is a small, easy feature to get right if built on the now-established pattern, and an easy one to get wrong (another silent cross-tenant hole) if built without checking who owns the parent scenario first.
- **Schema:** 1 new table.
- **Infra:** None.
- **Risk:** Low (if the ownership pattern is followed) / Medium (if it isn't — flagging so it isn't skipped under time pressure).

---

## Phase 3 — Needs new infrastructure this app doesn't have today

### 3a. Task-list action plan (owners, due dates, approve/execute status)
- **Approach:** New `ActionItem { id, scenarioId, description, status, assignee?, dueDate? }`. Requires changing `optimizeScenario()`'s return type in `lib/simulation-engine.ts` from `actionPlan: string[]` to structured items — a breaking change to a function multiple routes already call, so this needs careful, tested migration of that return shape (update `app/api/scenarios/optimize/route.ts` and the 5 existing tests in `__tests__/api/scenarios-optimize.test.ts` in lockstep).
- **⚠ Authorization flag:** Same as 2e — new CRUD surface, must use `verifyBusinessOwnership` from the start.
- **Schema:** 1 new table.
- **Infra:** None (no new infra, but the engine-return-type refactor is real work — listed in Phase 3 for that reason, not for infra).
- **Depends on:** 2e (same "new scoped child entity of Scenario" pattern, easier the second time).
- **Risk:** Medium.

### 3b. Natural-language scenario building via Gemini
- **Approach:** Reuses the Gemini wiring already in `app/api/recommendations/route.ts`, including its existing `responseSchema` structured-output technique — apply the same pattern to force `{priceIncrease, employeeCount, marketingBudget, supplierDelay}` as strict JSON. Critically: clamp/validate whatever the AI returns against the same bounds the manual UI already enforces (0–50% price, 1–50 staff, $0–100K marketing) before it ever reaches `runSimulation` — a malformed or adversarially-prompted AI response must not be able to push out-of-range values into the deterministic engine.
- **Schema:** None.
- **Infra:** None (no new infra — grouped in Phase 3 because of the validation work required, not infrastructure).
- **Risk:** Medium (mostly around prompt reliability and output validation, not architecture).

### 3c. Labor-law/compliance guardrails
- **Approach:** Static ruleset (`lib/compliance-rules.ts`): thresholds for mass-layoff notice, minimum staffing ratios, keyed by industry (region-aware accuracy isn't possible yet — `Business` has no address/region field at all).
- **⚠ Non-engineering flag:** This is a legal-accuracy claim, not just a feature. Recommend framing v1 explicitly as general guidance ("many jurisdictions require X — verify locally") rather than jurisdiction-precise compliance advice, and get a real legal review before marketing it as "compliant" anything. This is a liability question, not a code-review question.
- **Schema:** None for v1 (static config; a `region` field on `Business` and a real `ComplianceRule` table would be the accurate version, deferred).
- **Infra:** None.
- **Depends on:** Pairs naturally with 3a (surfaces as a warning attached to headcount-reduction action items).
- **Risk:** Low (engineering) / flagged (legal).

### 3d. Drift watch (background comparison + alerts)
- **Approach:** First feature needing a genuinely new capability: a scheduled job. Natural fit is **Vercel Cron** (a `crons` entry in `vercel.json` hitting a new API route on a schedule) — no new hosting provider, but nothing in this codebase runs on a schedule today. That route iterates all businesses, compares latest synced actuals (from 2d) against the last-approved plan, and writes an `Alert`/`DriftEvent` row when divergence exceeds a threshold. Delivery: build in-app first (`Notification` model + a bell icon reading unread alerts) — defer email/SMS, since no outbound-notification sending exists anywhere in this codebase yet and that's its own scoped piece of work.
- **⚠ Authorization flag — different shape than the client-facing IDORs fixed earlier:** this is a trusted server-only cron job with no external input, so it's not exposed to the classic "attacker supplies a businessId" attack. The real risk is an *internal* loop/closure bug — mixing up which business's data produced which alert while iterating all tenants in one job run. Needs an explicit test asserting alerts are correctly isolated per business (e.g., two businesses with diverging actuals in the same job run each get only their own alert).
- **Schema:** New `Alert`/`DriftEvent` table, new `Notification` table (or one combined table).
- **Infra:** Vercel Cron (new), in-app notification delivery (new).
- **Depends on:** 2d (needs actuals to compare against).
- **Risk:** High — new infra, new data model, new cross-tenant-loop risk, new UI surface, all at once. Should be its own dedicated implementation pass, not squeezed into a broader sprint.

---

## Phase 4 — Highest risk, needs its own dedicated design + review cycle

Neither of these should be scheduled into a general feature sprint. Both warrant a standalone planning session and, before shipping, a dedicated adversarial pass (`/code-review` or the `security-review` skill) — the same rigor applied to the bugs fixed earlier this session.

### 4a. Calibration from real synced transaction data
The best idea on the whole list, and the biggest lift.
- **The gap:** There is currently **no historical/time-series storage anywhere in this schema.** The sync routes (`shopify/sync`, `square/sync`, `quickbooks/sync`) only ever overwrite current snapshot fields or upsert current Product/Employee rows — nothing is stored per-period. Calibrating elasticity from "how demand actually responded to past price changes" requires that history to exist first.
- **Approach:** New `SyncedTransaction { id, businessId, source, occurredAt, amount, quantity, productId? }` model. Real historical backfill from each integration (current sync routes fetch a handful of recent records synchronously within one request — a multi-month backfill needs pagination and realistically needs to run as a background job, reusing whatever job infrastructure 3d establishes, not building a second job runner). Then a calibration step — a simple least-squares fit of demand against historical price changes is enough for v1; no need for a heavy ML dependency.
- **Schema:** New table, plus backfill logic per integration.
- **Infra:** Background job (reuse 3d's Vercel Cron infra rather than inventing a second mechanism).
- **⚠ Authorization flag:** The backfill job must scope strictly per-businessId per run — same internal-loop-correctness risk as 3d, at higher stakes since it's now writing financial transaction history, not just a notification.
- **Depends on:** 3d (reuse its job infrastructure), 1a (the thing being calibrated).
- **Risk:** High. Sequence last among the "new infra" items — do it once the job-running pattern is already proven by 3d, not before.

### 4b. Team/invite permissions (bookkeepers/advisors)
**The single riskiest item on this entire roadmap.**
- **Why:** Every tenant-scoped route fixed earlier this session — `employees`, `products`, `scenarios`, `scenarios/run`, the three integration syncs, QBO OAuth connect/callback — trusts a strict single-owner model: `verifyBusinessOwnership()` checks "does this business belong to *the* owner." Adding team members means re-deriving that core primitive to "does this business belong to a user who has at least EDITOR/VIEWER access" — a change to the authorization foundation of the whole app, immediately after a session spent finding and closing holes in exactly that foundation.
- **Real open questions that need answers before design, not during implementation:**
  - Does a VIEWER role see everything an OWNER sees, including the employee-salary/product-cost data the share-link data-minimization fix (this session) was specifically built to *not* expose?
  - Does inviting someone by email leak the business's existence to an inbox that hasn't accepted yet?
  - Do QuickBooks/Shopify/Square OAuth tokens become accessible to every team member, or only the owner?
- **New models:** `TeamMember { id, businessId, userId, role, invitedAt, acceptedAt? }`, `Invite { id, businessId, email, role, token, expiresAt }`.
- **Infra:** Invite-acceptance flow; email delivery for real invites (or a v1 shareable-link workaround to defer building email sending).
- **Recommendation:** Give this its own planning session — don't fold it into a general roadmap phase. Before it ships, write a cross-tenant/cross-role adversarial test suite mirroring the ones added this session (`__tests__/api/*.test.ts` "cross-tenant attack" cases), extended to cover cross-*role* attacks (a VIEWER hitting an OWNER-only route directly).
- **Risk:** Highest on the roadmap.

---

## Summary sequencing

| Phase | Features | New schema | New infra | Authz risk |
|---|---|---|---|---|
| 1 | 1a–1g (7 features) | 1 additive column (1e) | None | None |
| 2 | 2a–2e (5 features) | 4 tables/columns + 1 join table | None | Flagged: 2e |
| 3 | 3a–3d (4 features) | 2–3 tables | Vercel Cron + in-app notifications (3d) | Flagged: 3a, 3d |
| 4 | 4a–4b (2 features) | 1 table + full permission model | Reuses 3d's job infra | **Highest: 4b needs its own cycle** |

**Recommended order:** Phase 1 top to bottom (1a first, always), then Phase 2 in any order (2a/2b/2c/2d/2e are independent of each other), then Phase 3 (3d before 4a, since 4a reuses 3d's job infra), then Phase 4 last — and 4b (team permissions) treated as its own standalone project with a dedicated security review, not squeezed in alongside anything else.

---

## Next step

Pick a feature (or a small batch from the same phase) and I'll write the actual bite-sized TDD implementation plan for it via `superpowers:writing-plans` — with real code in every step, ready to execute — rather than planning further ahead speculatively.
