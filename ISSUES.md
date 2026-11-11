# Viable Appointment Scheduler — 3-Week Delivery Plan (GitHub Issues)

This file turns [SPECIFICATION.md](./SPECIFICATION.md) into **9 GitHub issues: 3 weeks (Week 04 → Week 06) × 3 team members**, one issue per person per week. `npm run sync:issues` reads it to create the issues.

**How the plan works**
- **No dependencies inside a week:** each issue only uses work merged in **earlier weeks**, plus the names already fixed in the spec (design tokens §8.2, data model §9, API paths §10). All three members start on Monday and work in parallel.
- **Every week ends with a working increment** of the app that the team can demo.
- **Merge by Friday:** each member merges their week's Pull Request (reviewed by one teammate, §13) before the next week starts, because next week's issues build on it.
- Branch names: `feature/wNN-<name>-<topic>`, e.g. `feature/w04-anisa-design-system`.

| Member | GitHub | Main areas |
| :--- | :--- | :--- |
| **Sthephani Platero** | `@sthephaniplatero` | Database, authentication backend, services, dashboard, appointments |
| **Anisa Chokwenda** | `@anichokwenda` | Design system, layout & landing, auth pages, public profile, professional settings, UX/accessibility |
| **Habyarimana Cassien** | `@habyarimanacassien` | Availability engine, booking API & UI, reschedule, deployment |

## Plan

| Week | Sthephani | Anisa | Cassien | End-of-week increment |
| :--- | :--- | :--- | :--- | :--- |
| **04** | **#13** Database, models, seed & Auth.js backend | **#14** Design system, layout & landing page | **#15** Availability engine & booking UI components | Branded landing runs; DB seeded; register API works; availability logic tested |
| **05** | **#16** Dashboard shell & services CRUD | **#17** Login/register pages & public profile | **#18** Availability, booking & reschedule APIs | Users sign up/in; professionals manage services; public profiles live; booking API works |
| **06** | **#19** Appointments dashboard, cancel & reschedule | **#20** Browse professionals, profile settings & UX pass | **#21** Booking flow on the profile page & deployment | All MVP stories (US1–US7) work end to end on the live site |

**Out of scope for these 3 weeks** (P2 in the spec): WhatsApp links, `.ics` export, email reminders, manual approval, reviews, payments.

---

## 📌 Issue #13: Week 04 — Sthephani: Database, Models, Seed & Auth.js Backend

### 🎯 Goal
Create the data layer and the authentication backend everything else uses. Spec: §7, §9, US1.

- **Week:** 04 · **Priority:** P0
- **Assignee:** `@sthephaniplatero`
- **Labels:** `week-04`, `database`, `auth`, `backend`, `p0`
- **Depends on:** nothing (start of project)

### ✅ Tasks
- [ ] Create the MongoDB Atlas M0 cluster, database user, and network access; database name `viable`.
- [ ] Install `mongoose`; create `lib/db.ts` (connection cached on `globalThis`).
- [ ] Create `models/User.ts` (with embedded `professionalProfile` and defaults), `models/Service.ts`, `models/Appointment.ts` exactly as in §9, including indexes (§9.5).
- [ ] Create `lib/api-response.ts` (`{ data }` / `{ error: { code, message, fields? } }`, §7.2).
- [ ] Create `scripts/seed.mjs` + `npm run seed` (2 professionals, 4 services, 1 client, a few appointments); share the demo logins with the team.
- [ ] Configure Auth.js v5: `lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts`, Credentials provider, bcryptjs, JWT session with `user.id` and `user.role`, `types/next-auth.d.ts`.
- [ ] Export helpers `requireUser()` and `requireRole(role)` from `lib/auth.ts` (`401` / `403`).
- [ ] `POST /api/auth/register` with Zod (name, email, password ≥ 8, role); `409` if the email exists; creates `professionalProfile` defaults for professionals.
- [ ] `proxy.ts`: redirect signed-out users from `/dashboard/*` to `/login?callbackUrl=…`.
- [ ] Add `.env.example` (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_URL`) and the setup steps to the README.

### 🏁 Done when
- `npm run seed` fills Atlas, and a Server Component can read the data through `lib/db.ts`.
- `POST /api/auth/register` creates users, and signing in with a seeded account returns a session with `id` and `role`.

---

## 📌 Issue #14: Week 04 — Anisa: Design System, Layout & Landing Page

### 🎯 Goal
Build the look and feel and the shared UI kit every page uses. Spec: §8, §11.2.

- **Week:** 04 · **Priority:** P0
- **Assignee:** `@anichokwenda`
- **Labels:** `week-04`, `design-system`, `frontend`, `p0`
- **Depends on:** nothing (start of project)

### ✅ Tasks
- [ ] Define the design tokens from §8.2 in the `@theme` block of `app/globals.css` (`--color-brand`, `--color-accent`, `--color-surface`, `--color-card`, `--color-ink`, `--color-muted`, `--color-success`, `--color-warning`, `--color-danger`).
- [ ] Load **Inter** with `next/font/google` (replace Geist) and apply the type scale (§8.3).
- [ ] Build `components/ui/`: `Button` (all variants + loading/disabled), `Input`, `Textarea`, `Select`, `Card`, `Badge`, `Modal` (Radix Dialog, focus trap, Esc), `Tabs`, `Avatar`, `Skeleton`, `EmptyState`.
- [ ] Follow the contrast rules in §8.2 (dark text on amber buttons).
- [ ] Update `app/layout.tsx` (title "Viable", description).
- [ ] Build `components/layout/Header.tsx` (logo, links to `/professionals`, Login/Register) with a mobile menu, and `Footer.tsx`.
- [ ] Build the landing page `/` with `components/landing/Hero`, `HowItWorks`, `CTASection`.
- [ ] Build the presentational `components/services/ServiceCard` and `ServiceList` (props only, typed from §9.2; `mode="public"` shows a "Book" button, `mode="dashboard"` shows Edit/Delete buttons that call `onEdit` / `onDelete`). Both Week 05 issues reuse them.
- [ ] Add `app/not-found.tsx`.

### 🏁 Done when
- `npm run dev` shows the branded landing page with Header and Footer at 375px and 1280px.
- All UI components (`components/ui/`, `ServiceCard`, `ServiceList`) are ready for other members to use in Week 05.

---

## 📌 Issue #15: Week 04 — Cassien: Availability Engine & Booking UI Components

### 🎯 Goal
Build the slot-calculation logic and the calendar components the booking flow needs. Spec: §6.1, §8.5, US4.

- **Week:** 04 · **Priority:** P0
- **Assignee:** `@habyarimanacassien`
- **Labels:** `week-04`, `booking-engine`, `frontend`, `p0`
- **Depends on:** nothing (start of project)

### ✅ Tasks
- [ ] Install `date-fns`, `@date-fns/tz`, and **Vitest** (`npm run test`).
- [ ] Implement `lib/availability.ts` as a **pure function**: input = working days/hours/timezone, service duration, date, existing appointments, "now"; output = free `"HH:mm"` slots. Follow every rule in §6.1 (60-day window, past slots hidden, overlap rule).
- [ ] Implement `lib/money.ts` (minor units ↔ display with `Intl.NumberFormat`, USD/KES).
- [ ] Unit tests: non-working day, fully booked day, slot ending after closing time, overlapping booking, today with past slots, 60-day limit.
- [ ] `components/booking/BookingCalendar` (past, non-working, and > 60-day dates disabled; keyboard accessible). Props: `workingDays`, `selectedDate`, `onSelect`.
- [ ] `components/booking/TimeSlotPicker` (available / selected / unavailable, loading skeleton, empty state). Props: `slots`, `loading`, `selected`, `onSelect`.
- [ ] Style with the token class names fixed in §8.2 (`bg-brand`, `text-ink`, …), so the components don't wait for Anisa's UI kit.

### 🏁 Done when
- `npm run test` passes.
- Both components render with sample data on a temporary page `app/dev/booking/page.tsx` (removed in Week 06).

---

## 📌 Issue #16: Week 05 — Sthephani: Dashboard Shell & Services CRUD

### 🎯 Goal
Signed-in users get their dashboard, and professionals manage their services. Spec: US2, §6.3, §11.2.

- **Week:** 05 · **Priority:** P0
- **Assignee:** `@sthephaniplatero`
- **Labels:** `week-05`, `dashboard`, `services`, `p0`
- **Depends on:** Week 04 (#13 models + auth helpers, #14 UI kit)

### ✅ Tasks
- [ ] `app/dashboard/layout.tsx`: session check, role-aware `DashboardSidebar` (§11.2), bottom navigation below 768px.
- [ ] Redirect clients who open professional-only pages (`/dashboard/services`, `/dashboard/profile`) to `/dashboard`.
- [ ] `/dashboard` overview page: greeting and the user's next 3 upcoming appointments (read-only).
- [ ] `GET/POST /api/services`, `PUT/DELETE /api/services/:id` with Zod, `requireRole('PROFESSIONAL')`, ownership checks (`403`), and archive-instead-of-delete when appointments reference the service.
- [ ] `/dashboard/services` page: `ServiceList` / `ServiceCard` from #14 in dashboard mode, `ServiceFormModal` (duration 15/30/45/60/90, price + currency USD/KES), `DeleteServiceDialog`, empty state "Create your first service".
- [ ] The list refreshes right after create/edit/delete.

### 🏁 Done when
- A seeded professional signs in, sees the dashboard, and can create, edit, archive, and delete services.
- A client cannot reach `/dashboard/services`, and the services API returns `403` to them.

---

## 📌 Issue #17: Week 05 — Anisa: Login/Register Pages & Public Profile

### 🎯 Goal
Users can sign up and sign in from the UI, and every professional has a public page. Spec: US1, US3, §10.

- **Week:** 05 · **Priority:** P0
- **Assignee:** `@anichokwenda`
- **Labels:** `week-05`, `auth`, `profile`, `frontend`, `p0`
- **Depends on:** Week 04 (#13 register API + Auth.js, #14 UI kit)

### ✅ Tasks
- [ ] `/login` and `/register` pages with `LoginForm`, `RegisterForm`, `RoleSelector` (React Hook Form + Zod, inline errors, keep inputs, redirect to `callbackUrl` or `/dashboard`).
- [ ] `UserMenu` in the Header (avatar/initials, Dashboard, Sign out) when signed in.
- [ ] `GET /api/professionals/:id` (profile + working hours + **active** services; `404` for unknown ids or clients; never returns `passwordHash` or email).
- [ ] `/professionals/[id]` page: `ProfileHeader`, `ServiceList` + `ServiceCard` (from #14) in public mode, an empty `<section id="booking">` where the booking panel goes in Week 06, `notFound()` handling.
- [ ] `generateMetadata` with the professional's name and headline.

### 🏁 Done when
- A visitor registers as a professional or client, is signed in, and can sign out from the Header.
- `/professionals/<seeded id>` shows the profile and its services; an unknown id shows the not-found page.

---

## 📌 Issue #18: Week 05 — Cassien: Availability, Booking & Reschedule APIs

### 🎯 Goal
The booking engine works through the API, with double-booking protection. Spec: US4, US5, US7, §6.1, §9.5, §10.

- **Week:** 05 · **Priority:** P0
- **Assignee:** `@habyarimanacassien`
- **Labels:** `week-05`, `booking-engine`, `backend`, `p0`
- **Depends on:** Week 04 (#13 models + auth helpers, #15 `lib/availability.ts`)

### ✅ Tasks
- [ ] `GET /api/professionals/:id/availability?serviceId=&date=` using `lib/availability.ts`; returns `{ timezone, slots }`; validates params with Zod.
- [ ] `POST /api/appointments` (`requireRole('CLIENT')`): validate the service is active and belongs to the professional, compute `endTime`, check the overlap rule **inside a MongoDB transaction**, save `serviceSnapshot`, status `CONFIRMED`; `409` on conflict.
- [ ] `PATCH /api/appointments/:id` with `{ action: "reschedule", startTime }` (participants only, before the original start): same transaction + overlap check, **ignoring the appointment itself**.
- [ ] A script or test that sends two bookings for the same slot at the same time and confirms exactly one succeeds.
- [ ] Unit tests for the reschedule overlap case.

### 🏁 Done when
- With seeded accounts (e.g. via a REST client), a client gets free slots, books one, sees it disappear from availability, gets `409` for a double booking, and can reschedule.

---

## 📌 Issue #19: Week 06 — Sthephani: Appointments Dashboard, Cancel & Reschedule

### 🎯 Goal
Both roles see and manage their appointments. Spec: US6, US7, §6.2.

- **Week:** 06 · **Priority:** P0
- **Assignee:** `@sthephaniplatero`
- **Labels:** `week-06`, `appointments`, `dashboard`, `p0`
- **Depends on:** Weeks 04–05 (#16 dashboard shell, #18 reschedule API, #15 calendar components)

### ✅ Tasks
- [ ] `GET /api/appointments?tab=upcoming|past|cancelled` following the tab rules in §6.2 (professional → `professionalId`, client → `clientId`).
- [ ] `DELETE /api/appointments/:id` (participants only, before `startTime`): sets `CANCELLED`, `cancelledAt`, `cancelledBy`, optional reason.
- [ ] `PATCH /api/appointments/:id` `{ action: "complete" }` (professional only, after `endTime`), in the same route as Cassien's reschedule action.
- [ ] `/dashboard/appointments` page: `Tabs`, `AppointmentList`, `AppointmentCard` (service, other party, date/time with time zone, status `Badge`), empty state per tab.
- [ ] `CancelModal` (confirmation + optional reason) and `RescheduleModal` (reuses `BookingCalendar` + `TimeSlotPicker` + the availability and reschedule APIs).
- [ ] Show Reschedule / Cancel / Mark as completed only when §6.2 allows them; refresh the list after each action.

### 🏁 Done when
- Professionals and clients see their appointments in the right tabs and can cancel, reschedule, and complete them according to §6.2.

---

## 📌 Issue #20: Week 06 — Anisa: Browse Professionals, Profile Settings & UX Pass

### 🎯 Goal
Visitors can find professionals, professionals can edit their profile and hours, and the app is polished and accessible. Spec: US3, US4, §8, §13.

- **Week:** 06 · **Priority:** P0 / P1
- **Assignee:** `@anichokwenda`
- **Labels:** `week-06`, `profile`, `ux`, `accessibility`, `p1`
- **Depends on:** Weeks 04–05 (#14 UI kit, #16 dashboard shell, #17 public profile)

### ✅ Tasks
- [ ] `GET /api/professionals?q=&category=` and the `/professionals` page with `FilterBar` (search + category, synced to the URL) and `ProfessionalCard` grid, with an empty state.
- [ ] `PATCH /api/professionals/:id` (owner only, Zod: headline, bio, category, phone, location, working days, start/end time with end after start, timezone).
- [ ] `/dashboard/profile` page with `ProfileForm` + `WorkingHoursEditor`; revalidate `/professionals/[id]` after saving.
- [ ] `loading.tsx` and `error.tsx` (with "Try again") for `/professionals`, `/professionals/[id]`, and `/dashboard`.
- [ ] Responsive check (375 / 768 / 1280px) and keyboard + contrast check (§8.2) on every page built in Weeks 04–05; fix what fails.

### 🏁 Done when
- `/professionals` lists and filters the seeded professionals.
- A professional changes their hours, and the public profile and available slots reflect it.
- Every page works by keyboard and on a phone.

---

## 📌 Issue #21: Week 06 — Cassien: Booking Flow on the Profile Page & Deployment

### 🎯 Goal
Clients book from the UI, and the app is live. Spec: US4, US5, §7.3.

- **Week:** 06 · **Priority:** P0
- **Assignee:** `@habyarimanacassien`
- **Labels:** `week-06`, `booking-engine`, `deployment`, `p0`
- **Depends on:** Weeks 04–05 (#15 calendar components, #17 public profile page, #18 booking APIs)

### ✅ Tasks
- [ ] `BookingPanel` + `BookingModal` inside the `#booking` section of `/professionals/[id]` (service → date → slot → notes → "Confirm Booking").
- [ ] Signed-out visitors go to `/login?callbackUrl=…`; professionals see booking disabled; a `409` shows "This time was just taken, please pick another".
- [ ] `/professionals/[id]/book/success` summary page with a link to `/dashboard/appointments`.
- [ ] Remove the temporary `app/dev/booking` route.
- [ ] Deploy to **Vercel**: set `MONGODB_URI` and `AUTH_SECRET`, allow Vercel in Atlas network access, seed demo data, add the live URL and demo logins to the README.

### 🏁 Done when
- On the live site, a client picks a service, date, and time on a profile, books it, and lands on the success page; the slot is no longer offered.
