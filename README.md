# Viable Appointment Scheduler (team_project_WDD430)

> A booking and appointment management platform for independent professionals (tutors, therapists, consultants, and service providers).

## 👥 Team Members
- Sthephani Platero 
- Anisa Chokwenda 
- Habyarimana Cassien 

## 📋 Project Documentation
- **[Project Specification Document](./SPECIFICATION.md)**: Full project specification covering user stories, acceptance criteria, technical requirements, core API endpoints, and implementation priorities.
- **[Project Issues & Tasks](./ISSUES.md)**: 3-week delivery plan: 9 GitHub issues (one per team member per week).
- **[Team Constitution](./.specify/memory/constitution.md)**: Development guidelines, TypeScript standards, Next.js architecture, and collaboration principles.

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS
- **Authentication:** Auth.js v5 (NextAuth)
- **Database:** MongoDB Atlas + Mongoose

## 🚀 Getting Started

### Prerequisites
- **Node.js 20.6+** (the seed script uses `node --env-file`)
- Access to the team's **MongoDB Atlas** cluster (ask a teammate for the connection string), or your own free M0 cluster:
  1. Create an **M0** cluster on [MongoDB Atlas](https://cloud.mongodb.com).
  2. **Database Access** → add a user with *Read and write to any database*.
  3. **Network Access** → add your IP (or `0.0.0.0/0` for development / Vercel).
  4. **Connect → Drivers → Node.js** → copy the URI and add the database name `viable` before the `?`.

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy the template and fill in the values:
```bash
cp .env.example .env.local
```

| Variable | Value |
| :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/viable?retryWrites=true&w=majority` |
| `AUTH_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` and paste the output |
| `AUTH_URL` | `http://localhost:3000` (not needed on Vercel) |

> ⚠️ Do **not** use `npx auth secret`: that package is now the Better Auth CLI and prints `BETTER_AUTH_SECRET`, which this project does not use.
> `.env.local` is git-ignored. Never commit it or paste the URI in chats/issues.

### 3. Seed the database
```bash
npm run seed
```
⚠️ This **deletes and recreates** all users, services, and appointments. Appointment dates are relative to today, so re-run it when the "upcoming" demo appointments become past.

**Demo accounts** (password for all: `Password123!`):

| Role | Email |
| :--- | :--- |
| Professional (tutoring) | `amina@example.com` |
| Professional (coaching) | `daniel@example.com` |
| Client | `client@example.com` |

The seed covers every dashboard tab: upcoming `CONFIRMED`, past `CONFIRMED`, `COMPLETED`, and `CANCELLED`.

**Test a login before the `/login` page exists.** Start `npm run dev` in one terminal, wait for "Ready", and keep it open. Then, in a **second** PowerShell terminal:
```powershell
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$csrf = (Invoke-RestMethod http://localhost:3000/api/auth/csrf -WebSession $s).csrfToken
Invoke-WebRequest http://localhost:3000/api/auth/callback/credentials -Method Post -WebSession $s -UseBasicParsing -Body @{ csrfToken = $csrf; email = 'amina@example.com'; password = 'Password123!' } | Out-Null
Invoke-RestMethod http://localhost:3000/api/auth/session -WebSession $s | ConvertTo-Json -Depth 3
```
A working login prints the user with its `id` and `role`. A wrong password prints nothing (empty session).
If you get "Unable to connect to the remote server" ("No es posible conectar con el servidor remoto"), the app is not running. If `npm run dev` reports port `3001`, use `3001` in the four lines.

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧱 Backend building blocks
| File | Purpose |
| :--- | :--- |
| `lib/db.ts` | `connectDB()`, a Mongoose connection cached on `globalThis` (server only) |
| `models/User.ts`, `models/Service.ts`, `models/Appointment.ts` | Mongoose schemas and indexes (SPECIFICATION §9) |
| `lib/constants.ts` | Shared enums (roles, categories, durations, currencies, statuses), safe to import in Client Components |
| `lib/api-response.ts` | `ok`, `created`, `ApiError`, `handleApiError` → `{ data }` / `{ error: { code, message, fields? } }` (§7.2) |
| `lib/auth.ts` | Auth.js v5 (`auth`, `signIn`, `signOut`) + `requireUser()` (401) and `requireRole(role)` (403) |
| `lib/validations/auth.ts` | Zod `loginSchema` and `registerSchema`, shared by forms and API |
| `POST /api/auth/register` | `{ name, email, password, role }` → `201`, or `409` if the email is taken |

Typical protected Route Handler:
```ts
import { requireRole } from "@/lib/auth";
import { created, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const user = await requireRole("PROFESSIONAL"); // 401 / 403
    // ... validate with Zod, connectDB(), check ownership with user.id
    return created({ /* ... */ });
  } catch (error) {
    return handleApiError(error);
  }
}
```

> **Server Components + `cacheComponents`:** this project enables `cacheComponents`, so `export const dynamic` is not allowed. Read from MongoDB inside a component that calls `await connection()` (from `next/server`) and render it inside `<Suspense>`.
