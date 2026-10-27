# Campus Lost and Found System with Claim Verification

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-green.svg)](https://vitest.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ecf8e.svg)](https://supabase.com/)

A full-stack, responsive web application developed for campus asset recovery and ownership verification, based on a B.Sc. Computer Science research project. The system addresses common shortcomings in university asset management through centralized item reporting, explainable baseline matching, structured confidential verification challenges, and administrative oversight.

---

## 1. Core Architectural Pillars

1. **Centralized Campus Reporting**:
   - Students, faculty, and campus security officers catalog lost or found items with standardized categories, dates, locations, public descriptions, and optional photographs.
   - Privacy-first: confidential identifying details (serial numbers, internal contents, unique engravings) are sequestered from the public and claimants.

2. **Explainable Baseline Matching Algorithm**:
   - An explainable, weighted algorithm evaluates candidates across four dimensions:
     - **Category Match**: 35 points (exact category match required)
     - **Text Similarity**: 30 points (Jaccard similarity on sanitized tokens from title and description)
     - **Date Proximity**: 20 points (stepped decay: 0 days = 20 pts, ≤2 days = 16 pts, ≤5 days = 12 pts, ≤10 days = 7 pts)
     - **Location Overlap**: 15 points (building and room token matching)
   - Candidate matches with score $\ge 25\%$ are suggested with a transparent, factor-by-factor breakdown.
   - **No exaggerated claims**: Image similarity alone is never accepted as ownership proof.

3. **Confidential Claim Verification Workflow**:
   - When an item is found, the finder/reporter sets a **Verification Challenge Question** (e.g., *"What stickers are on the laptop lid?"*).
   - The claimant submits their answers along with circumstances of loss and supporting documentation (purchase invoices, student ID cards, serial certificates).
   - Competing active claims from the same claimant are blocked.

4. **Campus Security Administrative Oversight**:
   - Only authorized campus security administrators may access `/admin` and finalize claim decisions.
   - Transactional safety: Approving a claim automatically updates the item lifecycle to `claimed`, notifies the owner, and rejects competing claims.
   - Immutable audit logging records actor, timestamp, entity ID, action, and decision justification.

---

## 2. Visual Design System

In compliance with the project specifications and institutional brand guidelines:
- **Official Institutional Logo**: `https://pg.nsuk.edu.ng/api/global/logo` (rendered across navbar, hero section, footer, admin console, and authentication screens).
- **Strictly NO gradients**: All surfaces, buttons, borders, and badges use clean solid colors.
- **Brand Palette**:
  - **Cyan/Blue (`#0793D4`)**: Primary institutional actions, found item indicators, active tabs, and identity accents.
  - **Warm Gold/Yellow (`#FBBF07`)**: Lost item indicators, pending reviews, unread badges, and secondary action buttons.
  - **Vibrant Green (`#79BF2B`)**: Verified claims, approved ownership adjudications, and success states.
  - **Charcoal (`#111827`)**: Top header banner, footer, high-contrast headings, and body copy.
  - **Neutral Surfaces (`#ffffff`, `#f9fafb`, `#e5e7eb`)**: Clean page canvas, card panels, and crisp borders.
  - **Destructive Red (`#dc2626`)**: Claim rejections and irreversible operations.
- **Micro-animations**: Subtle `motion/react` page intros respecting `prefers-reduced-motion`.

---

## 3. Technology Stack

- **Framework**: Next.js (App Router, React 19, TypeScript strict mode).
- **Styling**: Tailwind CSS v4 with custom solid color tokens.
- **Animations**: `motion/react` (Framer Motion API).
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS) policies and Storage buckets.
- **Validation**: Zod (strict client and server schema validation).
- **Testing**: Vitest for unit & integration tests; Playwright for end-to-end tests.
- **Deployment**: Vercel.

---

## 4. Application Routes

| Route | Role / Access | Description |
|---|---|---|
| `/` | Public | Homepage, platform introduction, metrics, and instant search |
| `/items` | Public | Searchable, paginated lost and found directory with filters |
| `/items/[id]` | Public / Protected | Item detail view; reveals confidential clues only to reporter or admin |
| `/report/lost` | Authenticated | Standardized lost item reporting form |
| `/report/found` | Authenticated | Standardized found item reporting form with challenge question setup |
| `/matches` | Authenticated | Authorized potential matches with transparent score breakdown |
| `/claims` | Authenticated | User's active and historical ownership claims |
| `/claims/[id]` | Claimant / Admin | Claim details, submitted evidence, and withdrawal / decision actions |
| `/notifications` | Authenticated | Real-time notifications for claim progress and potential matches |
| `/dashboard` | Authenticated | User dashboard with personal reports, active claims, and metrics |
| `/profile` | Authenticated | Profile management and student identification |
| `/auth/login` | Public | Authentication with one-click demo role switcher |
| `/auth/register` | Public | Student / staff registration |
| `/auth/forgot-password`| Public | Self-service password recovery |
| `/admin` | Admin Only | Administrative overview, real-time metrics, urgent adjudication queue |
| `/admin/claims` | Admin Only | Full claim adjudication queue with side-by-side ground truth comparison |
| `/admin/items` | Admin Only | Asset catalog moderation and lifecycle management |
| `/admin/users` | Admin Only | Campus user directory and assigned role verification |
| `/admin/audit-logs` | Admin Only | Immutable system event log and security trail |

---

## 5. Local Development and Deployment Guide

### Prerequisites
1. **Node.js LTS** (v20+ or v24+) and **npm**.
2. **Git**.
3. A **Supabase** account or local Supabase CLI instance.

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd lost-but-found
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Configure your Supabase credentials:
   ```dotenv
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   *(Note: The application includes a self-contained in-memory fallback pre-seeded with university data, allowing seamless local evaluation before Supabase credentials are connected).*

4. **Apply Supabase Database Migrations**:
   Run the migration file against your Supabase SQL editor:
   - File: `supabase/migrations/00001_initial_schema.sql`
   - Seed data (optional): `supabase/seed.sql`

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Testing & Quality Verification

Run the test suite:

- **Unit & Integration Tests (Vitest)**:
  ```bash
  npm run test
  ```
- **Type Checking (TypeScript strict mode)**:
  ```bash
  npm run typecheck
  ```
- **Linting (ESLint)**:
  ```bash
  npm run lint
  ```
- **End-to-End Tests (Playwright)**:
  ```bash
  npm run test:e2e
  ```
- **Production Build Validation**:
  ```bash
  npm run build
  ```

---

## 7. Pre-Configured Demo Accounts

For evaluator convenience, the top navigation and login screen include one-click profile switching:

| Account Name | Email | Role | Typical Actions |
|---|---|---|---|
| **Campus Security Admin** | `admin@university.edu` | `admin` | Access `/admin`, adjudicate claims, inspect audit logs, approve returns |
| **Alex Rivera** | `alex.rivera@student.university.edu` | `user` | Report lost MacBook, inspect matches, submit claims, withdraw claims |
| **Brenda Vance** | `b.vance@student.university.edu` | `user` | Report lost backpack, receive notifications |
| **Devon Chen** | `devon.chen@student.university.edu` | `user` | View approved AirPods Pro claim, monitor personal dashboard |

---

## 8. Deployment to Production (Vercel)

1. Commit and push the verified codebase to a protected GitHub/GitLab repository:
   ```bash
   git add .
   git commit -m "feat: complete lost and found system with claim verification"
   git push origin main
   ```
2. Import the repository in the **Vercel Dashboard**.
3. Configure environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. In Supabase Auth Settings, add your production Vercel domain to the **Authorized Redirect URLs**.
5. Trigger deployment and run end-to-end smoke tests on the production URL.

---

## 9. Academic Project Compliance

This software satisfies all requirements specified in the B.Sc. Computer Science specification:
- Centralized reporting with privacy-preserving fields.
- Explainable matching algorithm with documented scoring weights.
- Multi-step claim verification requiring specific evidence and question challenge answers.
- Strict server-side role separation between Ordinary Users and Campus Administrators.
- Zero decorative UI gradients; solid, accessible design palette.
