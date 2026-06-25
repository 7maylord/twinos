# TwinOS — Business Digital Twin Platform

**TwinOS** is a multi-tenant SaaS platform that lets small and medium businesses build a digital twin of their operations and simulate decisions safely before executing them in the real world.

Stop guessing the impact of price hikes, hiring sprints, or marketing investments. **Simulate first.**

---

## What it does

Most SMB owners make high-stakes decisions with nothing more than gut feel or a spreadsheet. TwinOS changes that by letting you model your business mathematically, then run "what-if" experiments against that model — getting projected profit, revenue, headcount, and inventory risk before a single dollar is spent or a single hire is made.

### The four core workflows

**1. Build your digital twin**
Connect your real business data by filling out your baseline metrics (revenue, marketing spend, inventory costs, fixed costs) or sync it directly from QuickBooks, Shopify, or Square. Add your product catalog and employee directory. The platform uses this as the ground truth for all simulations.

**2. Run scenario simulations**
Configure a hypothetical scenario with four levers:

- **Price increase** (0–50%): how much to raise prices across the board
- **Headcount** (1–50 staff): simulated employee count
- **Marketing budget** ($0–$100K/mo): monthly spend
- **Supplier delay** (none / minor / moderate / severe): supply chain disruption

The simulation engine applies these adjustments to your baseline and forecasts **projected revenue, profit, headcount, and inventory risk** across a time horizon you choose (30 days, 90 days, 6 months, or 12 months).

**3. Explore the counterfactual**
Instead of configuring levers manually, tell the optimizer your goal — "increase profit by 20%" or "grow revenue by 35%" — and it reverse-engineers the smallest set of operational changes needed to hit that target. The result is a prioritized, quantified action plan explaining _what_ to change, _by how much_, and _why_ each change contributes.

**4. Share results**
Generate a public read-only share link for any scenario result. External advisors or business partners can view the forecast charts and metrics without needing an account.

---

## How the simulation engine works

The engine is a deterministic mathematical model — no AI, no black box.

### Revenue model

```
projectedRevenue = baselineRevenue × priceMultiplier × demandMultiplier × seasonalFactor
```

- **priceMultiplier** = `1 + priceIncrease / 100`
- **demandMultiplier** accounts for two effects:
  - Price elasticity: a 10% price increase reduces demand by ~4.5% (inelastic demand)
  - Marketing lift: increased marketing spend boosts demand proportionally to the delta over baseline (10% elasticity coefficient)
- **seasonalFactor** varies by period — e.g. the 6-month horizon uses `[0.95, 0.90, 1.00, 1.10, 1.15, 1.20]` for Jan–Jun

### Cost model

```
projectedProfit = projectedRevenue
  − (employeeCount × averageSalary)
  − marketingBudget
  − (baselineInventory × demandMultiplier)   ← scales with demand
  − baselineFixedCosts
```

Inventory costs scale with demand because higher demand requires more stock. Fixed costs are invariant to the scenario.

### Inventory risk score

A 0–1 score derived from the demand multiplier and supplier delay severity:

```
inventoryRisk = clamp(0.05, 1.0,  0.5 × demandMultiplier × (1 + delayFactor))
```

Delay factors: none = 0, minor = 0.15, moderate = 0.35, severe = 0.65.

---

## How the counterfactual optimizer works

The optimizer uses **hill climbing local search** over the three controllable levers: price, headcount, and marketing budget.

### Search process

Starting from the business's current baseline, it iterates up to 800 times, evaluating all 26 neighbors (±0.5% price, ±1 staff, ±$500 marketing) and moving to whichever improves the score. It stops when no neighbor is better (local optimum).

### Scoring function

```
if projected_value < target:
    score = −(target − value)² − 0.01 × changeCost − penalties
else:
    score = −changeCost − penalties
```

When the target isn't yet met, the optimizer aggressively chases the metric. Once the target is met, it switches to minimizing **change cost** — preferring small, low-disruption adjustments over large disruptive ones. `changeCost` penalizes changes from baseline quadratically, with headcount changes weighted 5× more than price or marketing changes (because hiring/firing is more disruptive than a price tweak).

### Constraints

Two hard constraints prevent degenerate recommendations:

- **Headcount floor**: the optimizer will never recommend going below 60% of the current headcount. Cutting below this threshold is penalized with a score of −10¹².
- **Marketing ceiling**: spending more than 25% of projected revenue on marketing is penalized quadratically. This stops the optimizer from always recommending "max out marketing spend."

### Baseline anchoring

The optimizer scores against the **average across all projected periods**, not just the final (peak-season) month. This prevents the hill climber from over-correcting due to seasonal peaks inflating the apparent baseline.

### Action plan generation

The recommended actions are not generic templates. Each item is calculated from the actual delta found:

- **Price**: shows the projected revenue uplift in dollars; flags churn risk if increase exceeds 15%
- **Headcount**: shows the monthly payroll savings or cost; flags if near the operational floor
- **Marketing**: shows the total budget and its share of projected revenue; recommends ROI reallocation instead of raw spend increase if marketing already exceeds 20% of revenue

---

## Multi-tenancy and data isolation

TwinOS is fully multi-tenant. Every user can own multiple business twins and switch between them.

**Active business resolution** (`lib/auth-helpers.ts → getActiveBusiness()`):

1. Resolve the user's email via Clerk (or fall back to `demo@twinos.com` in keyless mode)
2. Look up the user's businesses in the primary database (AWS Aurora PostgreSQL or local SQLite)
3. If an `active-business-id` cookie is set and matches one of the user's businesses, return that one
4. Otherwise, return the most recently created business
5. Demo mode fallback also respects the cookie before falling back to `prisma.business.findFirst()`

Every API route that reads or writes business data calls `getActiveBusiness()` — never a raw `prisma.business.findFirst()`. All mutation endpoints (PUT, DELETE on employees and products) verify that the record's `businessId` matches the active business before proceeding, preventing cross-tenant data access.

---

## Technology stack

| Layer        | Technology                       | Role                                                                                 |
| ------------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| Framework    | Next.js 16 (App Router)          | Server components, API routes, SSR                                                   |
| Auth         | Clerk v7                         | Multi-tenant identity, route protection                                              |
| ORM          | Prisma 7                         | Schema, migrations, type-safe queries                                                |
| Primary DB   | AWS Aurora PostgreSQL (prod) / SQLite (dev) | Users, businesses, products, employees, scenarios                                    |
| Cache / Logs | Amazon DynamoDB                  | Forecast cache, optimization run logs                                                |
| UI           | React 18, Tailwind CSS, Recharts | Charts, dashboards, responsive layout                                                |
| AI           | Gemini 1.5 Flash (Google)        | Scenario recommendation narratives; falls back to rule-based engine if key is absent |
| Integrations | QuickBooks, Shopify, Square      | Live financial, catalog, and payroll sync                                            |
| Testing      | Vitest                           | Unit tests for all API routes                                                        |

---

## Directory structure

```
TwinOS/
├── __tests__/api/          # Vitest unit tests for all API routes
├── app/
│   ├── (auth)/             # Clerk sign-in / sign-up pages
│   ├── admin/              # Internal admin dashboard
│   ├── api/
│   │   ├── business/       # GET active business
│   │   ├── employees/      # CRUD employees (ownership-verified)
│   │   ├── products/       # CRUD products (ownership-verified)
│   │   ├── scenarios/      # List / create scenarios
│   │   │   ├── run/        # POST — execute a simulation
│   │   │   └── optimize/   # POST — run counterfactual optimizer
│   │   ├── integrations/
│   │   │   ├── quickbooks/sync/
│   │   │   ├── shopify/sync/
│   │   │   └── square/sync/
│   │   ├── recommendations/ # Rule-based recommendation engine
│   │   └── admin/          # Admin stats endpoints
│   ├── dashboard/
│   │   ├── page.tsx        # Main dashboard
│   │   ├── compare/        # Side-by-side scenario comparison
│   │   ├── optimize/       # Counterfactual explorer UI
│   │   └── settings/       # Business settings, integrations, team
│   ├── onboarding/         # New business setup wizard
│   ├── results/            # Simulation results and charts
│   ├── scenario-builder/   # Scenario configuration UI
│   └── share/[id]/         # Public read-only report links
├── components/
│   ├── dashboard/          # Sidebar, header, scenario list, KPI cards
│   └── scenario-builder/   # Scenario form component
├── lib/
│   ├── auth-helpers.ts     # getActiveBusiness(), getActiveUserEmail()
│   ├── db.ts               # Prisma client singleton
│   ├── dynamodb.ts         # DynamoDB cache and log helpers
│   ├── encryption.ts       # Token encryption for integration credentials
│   ├── integrations/       # QuickBooks OAuth token helpers
│   ├── simulation-engine.ts # Forecasting model and optimizer
│   └── stats/              # Admin stats aggregations
├── prisma/
│   ├── schema.prisma
│   └── seed.ts             # Seeds two demo businesses (Halo Café, Acme Tech)
├── scripts/
│   ├── db-switch.js        # SQLite ↔ AWS Aurora PostgreSQL switcher
│   └── test-all.ts         # Simulation engine integration tests
└── vitest.config.ts
```

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/7maylord/twinos.git
cd twinos
pnpm install
```

### 2. Configure environment variables

Create a `.env` file:

```env
# Database (SQLite for local dev — no setup required)
DATABASE_URL="file:./dev.db"

# Gemini AI (optional — falls back to rule-based recommendations if omitted)
GEMINI_API_KEY="your-gemini-api-key-here"

# AWS (optional — falls back to local JSON mock if omitted)
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"

# Clerk (optional — bypasses auth entirely if omitted, good for local dev)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# QuickBooks (optional)
QBO_CLIENT_ID="..."
QBO_CLIENT_SECRET="..."
```

**Local dev works without any external credentials.** Omitting `CLERK_SECRET_KEY` puts the app in demo mode (no login required). Omitting `GEMINI_API_KEY` makes the recommendation engine fall back to the built-in rule-based generator. Omitting AWS keys switches Amazon DynamoDB to a local file-backed mock. Omitting QuickBooks keys puts the integration sync in mock mode.

### 3. Set up the database (SQLite or AWS Aurora)

```bash
npx prisma db push
pnpm prisma db seed
```

The seed creates two demo businesses — **Halo Café** and **Acme Tech Solutions** — so you can test the business switcher immediately.

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database switching (SQLite ↔ AWS Aurora PostgreSQL)

```bash
pnpm db:postgres   # Switch to AWS Aurora PostgreSQL (or local Postgres)
pnpm db:sqlite     # Switch back to SQLite
```

Each command updates `prisma/schema.prisma`, adjusts the Prisma adapter in `lib/db.ts`, and regenerates the Prisma client.

---

## Running tests

```bash
pnpm test:unit      # Vitest — API route unit tests (52 tests, ~0.5s)
pnpm test           # tsx integration tests — simulation engine
```

The Vitest suite mocks Prisma and `getActiveBusiness()` to test route behavior in isolation, covering:

- Cross-tenant attack prevention (PUT/DELETE ownership verification)
- Active business resolution for all routes that previously used `prisma.business.findFirst()`
- Input validation and error responses
- Integration sync fallback logic (QuickBooks, Shopify, Square)

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE).
