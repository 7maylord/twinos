# 🌍 TwinOS — AI-Powered Business Digital Twins

**TwinOS** is an advanced B2B SaaS platform that enables Small and Medium Businesses (SMBs) to build a complete digital twin of their operations (products, employees, revenues, and marketing expenses) and simulate complex scenarios safely before executing them in the real world.

Stop guessing the impact of price hikes, hiring sprints, or marketing investments. **Simulate first.**

---

## 📖 The Story

### 💡 Inspiration

Small and Medium-sized Businesses (SMBs) are the backbone of the economy, yet they often make expensive, make-or-break decisions with limited visibility into future consequences. If a restaurant owner wants to hire three new staff members and raise prices by 10%, they usually rely on intuition, basic spreadsheets, or expensive consultants. Meanwhile, Fortune 500 enterprises use sophisticated simulation software to model outcomes before spending a dime.

We were inspired to democratize this power. We built TwinOS to give every SMB owner their own "Digital Twin"—a virtual, living model of their business where they can simulate operational, financial, and staffing decisions safely in a sandbox before executing them in the real world.

### ⚙️ What it does

TwinOS is a complete AI-powered business simulation platform.

- **Digital Twin Builder:** Users connect their data (or sync via integrations like QuickBooks, Square, and Shopify) to create a living model of their revenue streams, products, employees, and fixed costs.
- **Scenario Engine:** Users can create hypothetical events (e.g., "Marketing budget +50%" or "Supplier delay of 2 weeks").
- **Simulation & Forecasting:** Our engine runs the scenario against the business's baseline and forecasts the impact on Profit, Revenue, Employee Capacity, and Inventory Risk over 30, 90, or 365 days.
- **Counterfactual Explorer:** Instead of guessing, users can tell the system their goal (e.g., "Increase profit by 20%") and TwinOS will calculate the exact operational changes required to achieve it.

### 🚀 What's next for TwinOS

We are planning to upgrade the Counterfactual Optimization Engine from Hill Climbing to Genetic Algorithms, allowing it to search millions of scenario permutations in seconds. We also plan to introduce real-time multiplayer collaboration, so business partners can tweak simulations together simultaneously.

---

## 🚀 Core Features

### 1. Dynamic Digital Twin Builder

- **Asset Directories:** Manage your product line (pricing vs. unit costs) and employee directory (salaries, roles, and shifts) in a cohesive workspace.
- **Batch CSV Import:** Accelerate onboarding by drag-and-dropping CSV files. The platform generates CSV templates on-the-fly for products and staff records.

### 2. Scenario Simulation Engine

- **Multi-Variable Adjustments:** Slide price increases (0-100%), change headcount levels, scale marketing budgets, and simulate supplier disruption delays (minor, moderate, severe).
- **Mathematical Forecasting Model:** Implements real-world elasticity models (where price increases scale demand drop-off, and marketing spends boost demand) layered over seasonal calendar fluctuations.
- **Multi-Horizon Toggle:** Instantly toggle forecasts between **30 days (weekly layout)**, **90 days**, **6 months**, and **12 months** to view near-term and long-term impacts.

### 3. Counterfactual Optimization Engine

- **Hill Climbing Local Search:** Input a target financial growth target (e.g. increase net profit by 35%). The local search optimizer sweeps parameters (pricing, staff counts, and budgets) to find the path of least resistance.
- **Change Cost Penalizations:** Prefers low-disruption changes (minor pricing increases) over highly disruptive shifts (hiring/firing staff), outputting a step-by-step checklist of concrete operational steps.

### 4. Dynamic Admin Console

- **System-Wide Analytics:** Aggregated KPI boards monitoring active business twin registries, simulation counts, baseline MRR totals, and calculated API request traffic.
- **Operator Audits:** Logs the 10 most recent simulations with price adjustments, parent business context, and calculated net profit deltas.

### 5. Premium Report Sharing & PDF Export

- **Clipboard Sharing:** A one-click "Share Report" link generator creates unique public-facing URLs (`/share/[id]`) that bypass auth. External partners can interact with forecast switcher graphs dynamically.
- **Optimized Print Stylesheets:** Press "Export Report" to invoke print styling rules that hide dashboard chrome (sidebars, navigation buttons) and align charts beautifully to standard PDF sheets.

---

## 🛠️ Technology Stack

| Layer              | Technologies                              | Role                                                                         |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------------------- |
| **Core Framework** | Next.js 16 (App Router, Turbopack)        | Server-side rendering, API route handlers, React components                  |
| **Authentication** | Clerk v7 SDK                              | Tenant boundaries, custom Sign-In/Sign-Up pages, route protection            |
| **Database ORM**   | Prisma 7                                  | Schema definitions, migrations, relational query assembly                    |
| **Core Database**  | AWS Aurora (PostgreSQL) / SQLite (Dev)    | Relational operational data storage (Users, Businesses, Products, Employees) |
| **Cache Database** | Amazon DynamoDB                           | High-speed optimization logs (`OptimizationRuns`) & caches (`ForecastCache`) |
| **Integrations**   | QuickBooks, Shopify, Square APIs          | Live financial, product, and labor data syncing                              |
| **AI Evaluation**  | OpenAI API (offline rule-based fallbacks) | AI consultant narratives, action advice summaries                            |
| **Data Visuals**   | Recharts & Tailwind CSS                   | Responsive analytics charts, premium fintech glassmorphism design            |

---

## 📦 Directory Structure

```
TwinOS/
├── app/                      # Next.js App Router Pages
│   ├── (auth)/               # Clerk custom authentication pages
│   ├── admin/                # Dynamic SaaS Admin Dashboard page
│   ├── api/                  # Backend REST API endpoints
│   ├── dashboard/            # Core user workspace (Onboarding, Builder, Compare, Settings)
│   ├── results/              # Detailed scenario simulation charts
│   ├── share/                # Public read-only reports router
│   ├── globals.css           # Premium Tailwind variables & print stylesheets
│   └── layout.tsx            # Global metadata and provider wrappers
├── components/               # Specialized UI widgets (Admin lists, charts, sidebar)
├── generated/                # Auto-generated Prisma client classes
├── lib/                      # Business logic modules
│   ├── db.ts                 # Database client exporter
│   ├── dynamodb.ts           # DynamoDB caches and logs helpers
│   └── simulation-engine.ts  # Scenario projection mathematical formulas
├── prisma/                   # SQLite databases, schemas, and seeding scripts
├── scripts/                  # Provider-switcher and helper scripts
├── vercel.json               # Vercel deployment pipeline configurations
├── package.json              # Dependencies and execution commands
└── README.md                 # Project documentation
```

---

## ⚙️ Setup & Local Development

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/7maylord/twinos.git
cd twinos
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory. You can use the values in `.env.example` as a template:

```env
# Local Database
DATABASE_URL="file:./dev.db"

# AI Integration
OPENAI_API_KEY="your-openai-api-key-here"

# AWS Databases
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="us-east-1"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

> 💡 **Friction-Free Local Testing:** If `CLERK_SECRET_KEY` is omitted, the middleware automatically bypasses authentication to let developers and hackathon judges access the dashboard passwordless. If `OPENAI_API_KEY` is omitted, the AI recommendations automatically revert to an offline rule-based heuristics engine. If AWS keys are omitted, DynamoDB falls back to a local JSON sandbox file.

### 3. Setup and Seed Database

Run the Prisma migrations and seed the local SQLite database with our default Café digital twin profile:

```bash
npx prisma db push
pnpm prisma db seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 CLI Database Switching (SQLite vs. PostgreSQL)

Prisma models compile search engines specifically configured for individual databases. TwinOS features an automated switcher script to easily transition configurations between local sandbox environments and production AWS Aurora databases:

- **To switch to production PostgreSQL (AWS Aurora):**

  ```bash
  pnpm db:postgres
  ```

  _(Updates `prisma/schema.prisma` to `"postgresql"`, adjusts `lib/db.ts` initialization, and runs `prisma generate`)_

- **To return to local SQLite:**
  ```bash
  pnpm db:sqlite
  ```
  _(Restores `"sqlite"` provider, enables adapted better-sqlite3 drivers, and runs `prisma generate`)_

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this project better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## ⚖️ License

Distributed under the MIT License. See [LICENSE](file:///Users/macbook/Programming/TwinOS/LICENSE) for more information.

---

## 📬 Contact & Support

For queries, feature suggestions, or potential partnership opportunities:

- **GitHub Repository:** [7maylord/twinos](https://github.com/7maylord/twinos)
- **Submit Feedback:** Open a GitHub Issue for direct support.
