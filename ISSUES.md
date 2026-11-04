# Viable Appointment Scheduler — Project Issues & Implementation Tasks

This document translates the **Spec-Kit Project Specification** ([SPECIFICATION.md](./SPECIFICATION.md)) into well-defined, actionable GitHub Issues organized by User Story and foundational phases. Each issue breaks down tasks across **Database**, **Backend**, and **Frontend**, with clear acceptance criteria and priority levels.

---

## Issue Overview & Roadmap

| Issue # | Title | User Story | Priority | Primary Area |
| :--- | :--- | :--- | :--- | :--- |
| **#1** | [Foundational] Project Setup, Design System & Supabase Database Setup | Infra | **P0** | Fullstack / DB |
| **#2** | [Auth & Users] User Registration, Authentication & Role Management | US1 | **P0** | Fullstack |
| **#3** | [Services] Services CRUD Management for Professionals | US2 | **P0** | Fullstack |
| **#4** | [Profiles] Professional Public Profile & Working Hours Setup | US3 | **P0** | Fullstack |
| **#5** | [Booking] Real-Time Slot Availability & Appointment Booking Engine | US4 | **P0** | Fullstack |
| **#6** | [Dashboard] Appointments Management (View, Reschedule, Cancel) | US5 | **P0 / P1** | Fullstack |
| **#7** | [UX & Quality] Responsive UI Polish, Loading States, Empty States & Form Validations | Polish | **P1** | Frontend |
| **#8** | [Future Enhancements] WhatsApp Confirmation Links & Calendar Export (.ics) | US6 / US7 | **P2** | Fullstack |

---

## 📌 Issue #1: [Foundational] Project Setup, Design System & Supabase Database Setup

### 📋 Description
Set up the foundational Supabase project (managed PostgreSQL), database tables, client configuration, and base design system components that all future user stories rely on.

- **Priority:** P0 (Blocking prerequisite)
- **Labels:** `foundation`, `database`, `supabase`, `frontend`, `p0`

### 🛠️ Implementation Tasks
#### 🗄️ Database
- [ ] Create a Supabase project at [supabase.com](https://supabase.com) and obtain Project URL & Anon Key.
- [ ] Define baseline relational tables in Supabase SQL Editor / Table Editor:
  - `profiles` (`id` references `auth.users(id)` or UUID, `name`, `email`, `role`: `'PROFESSIONAL' | 'CLIENT'`, `bio`, `headline`, `phone`, `address`, `working_days`, `working_hours_start`, `working_hours_end`, `slot_duration`, `created_at`, `updated_at`)
  - `services` (`id` UUID primary key, `professional_id` references `profiles(id)`, `title`, `description`, `price` numeric, `duration` int, `is_active` bool, `created_at`, `updated_at`)
  - `appointments` (`id` UUID primary key, `professional_id` references `profiles(id)`, `service_id` references `services(id)`, `client_id` nullable references `profiles(id)`, `client_name`, `client_email`, `client_phone`, `scheduled_at` timestamptz, `end_time` timestamptz, `status`: `'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'`, `notes`, `created_at`)
- [ ] Add initial seed data (insert 2 sample professionals, 4 services, and working schedules in Supabase).
- [ ] Configure Row Level Security (RLS) policies for public reads and authenticated owner writes.

#### ⚙️ Backend
- [ ] Install Supabase client packages (`npm install @supabase/supabase-js @supabase/ssr`).
- [ ] Create Supabase client singletons:
  - `lib/supabase/client.ts` (browser client via `createBrowserClient`)
  - `lib/supabase/server.ts` (server client via `createServerClient` for Server Components & Route Handlers)
- [ ] Implement central API error handler utility and response wrapper in `lib/api-response.ts`.
- [ ] Configure Zod schema validation helpers in `lib/validations/`.

#### 💻 Frontend
- [ ] Configure Tailwind CSS color palette (`brand`, `accent`, `muted`) and typography scale in `app/globals.css`.
- [ ] Create reusable UI components in `components/ui/`:
  - `Button.tsx` (primary, secondary, outline, destructive, loading spinner state)
  - `Input.tsx` & `Textarea.tsx` (with label, helper text, and error states)
  - `Card.tsx` (card container, header, content, footer)
  - `Badge.tsx` (status badges: confirmed, pending, cancelled)
  - `Modal.tsx` / `Dialog.tsx` (accessible dialog for forms and confirmations)
- [ ] Create global navigation Header (`components/Header.tsx`) and Footer (`components/Footer.tsx`).

### ✅ Acceptance Criteria
- Supabase connection test successfully queries the database from a Server Component.
- Running `npm run dev` renders base layout with consistent typography and color system.

---

## 📌 Issue #2: [Auth & Users] User Registration, Authentication & Role Management

### 📋 Description
**User Story 1:** As a user (professional or client), I want to create an account and sign in securely so that I can access my personalized dashboard and manage my bookings.

- **Priority:** P0
- **Labels:** `auth`, `backend`, `frontend`, `p0`

### 🛠️ Implementation Tasks
#### 🗄️ Database
- [ ] Verify `User` model supports credentials provider (email + hashed password) and role enum (`PROFESSIONAL`, `CLIENT`).
- [ ] Ensure unique constraint on `User.email`.

#### ⚙️ Backend
- [ ] Install and configure **Auth.js v5** (`next-auth@beta` or compatible Auth.js) in `app/api/auth/[...nextauth]/route.ts`.
- [ ] Implement password hashing with `bcryptjs`.
- [ ] Create registration endpoint `POST /api/auth/register`:
  - Validate email uniqueness, password strength (min 6 characters), name, and role.
  - Return safe user object (excluding password hash).
- [ ] Create route protection middleware (`middleware.ts`) to restrict `/dashboard/*` routes to authenticated users.

#### 💻 Frontend
- [ ] Build `/register` page with a role selector (tab: *"I am a Professional"* vs. *"I want to book services"*).
- [ ] Build `/login` page with email and password inputs.
- [ ] Add client-side validation using React Hook Form and Zod.
- [ ] Display inline error alerts for invalid credentials or existing email.
- [ ] Update Header with user avatar / name dropdown and "Sign Out" button when logged in.

### ✅ Acceptance Criteria
- User can successfully register as either a `PROFESSIONAL` or `CLIENT`.
- User can log in with valid credentials and is redirected to `/dashboard`.
- Invalid login attempts display friendly error messages without page crash.
- Unauthenticated users attempting to access `/dashboard` are redirected to `/login`.

---

## 📌 Issue #3: [Services] Services CRUD Management for Professionals

### 📋 Description
**User Story 2:** As a professional, I want to create, read, update, and delete my service offerings so that clients know what services I offer, their prices, and durations.

- **Priority:** P0
- **Labels:** `services`, `crud`, `backend`, `frontend`, `p0`

### 🛠️ Implementation Tasks
#### 🗄️ Database
- [ ] Ensure foreign key relation between `Service.professionalId` and `User.id`.
- [ ] Add index on `Service.professionalId` for query performance.

#### ⚙️ Backend
- [ ] `GET /api/services`: List services for the authenticated professional (or by `?professionalId=xyz` for public view).
- [ ] `POST /api/services`: Create a new service (fields: `title`, `description`, `price`, `duration` in minutes). Validate required fields.
- [ ] `PUT /api/services/:id`: Update existing service details (verify professional owns the service).
- [ ] `DELETE /api/services/:id`: Soft delete / archive or remove service (check if active appointments are linked).

#### 💻 Frontend
- [ ] Create Services Management view at `/dashboard/services`.
- [ ] Build `ServiceCard.tsx` displaying title, price, duration badge, description, and Action buttons (Edit, Delete).
- [ ] Build `ServiceFormModal.tsx` for creating and editing services with price input (formatted in currency) and duration selector (15, 30, 45, 60 mins).
- [ ] Build delete confirmation dialog with warning.
- [ ] Implement optimistic UI or instant state refresh upon creating/editing/deleting a service.
- [ ] Add empty state view when a professional has not yet created any services.

### ✅ Acceptance Criteria
- Professional can add a service with valid title, duration, and price.
- Changes to existing services persist in the database and reflect immediately on the UI.
- Non-owners cannot edit or delete services belonging to another professional.

---

## 📌 Issue #4: [Profiles] Professional Public Profile & Working Hours Setup

### 📋 Description
**User Story 3:** As a professional, I want to set up my public profile, bio, working hours, and contact info so that clients can discover me and check my availability.

- **Priority:** P0
- **Labels:** `profile`, `frontend`, `backend`, `p0`

### 🛠️ Implementation Tasks
#### 🗄️ Database
- [ ] Define `workingDays` (array of integers `[1, 2, 3, 4, 5]` for Mon-Fri) in `ProfessionalProfile`.
- [ ] Store `workingHoursStart` (e.g. `"09:00"`) and `workingHoursEnd` (e.g. `"17:00"`).

#### ⚙️ Backend
- [ ] `GET /api/professionals/:id`: Fetch public profile, professional name, avatar, bio, working hours, and active services list.
- [ ] `PATCH /api/professionals/profile`: Update authenticated professional's profile and working schedule.
- [ ] Validate working hours format (start time must be before end time).

#### 💻 Frontend
- [ ] Create Profile Setup / Edit tab in Dashboard (`/dashboard/profile`):
  - Bio, headline, phone number, address/location.
  - Working days checkboxes (Monday through Sunday).
  - Working hours start/end dropdowns.
- [ ] Build public profile page at `app/professionals/[id]/page.tsx`:
  - Server-rendered for fast loading and SEO.
  - Header banner with photo, name, title/profession, bio, and contact info.
  - Grid of available services offered by the professional.
  - "Book an Appointment" call to action.

### ✅ Acceptance Criteria
- Professional can save working hours (e.g. 9:00 AM - 5:00 PM, Monday to Friday).
- Public URL `/professionals/[id]` renders the professional's profile correctly to any visitor without requiring login.
- Updating profile in the dashboard immediately updates the public page.

---

## 📌 Issue #5: [Booking] Real-Time Slot Availability & Appointment Booking Engine

### 📋 Description
**User Story 4:** As a client, I want to select a service, view available dates/times based on the professional's schedule, and book an appointment in seconds.

- **Priority:** P0
- **Labels:** `booking-engine`, `algorithm`, `backend`, `frontend`, `p0`

### 🛠️ Implementation Tasks
#### 🗄️ Database
- [ ] Index `Appointment` on `(professionalId, scheduledAt)` to accelerate availability lookups.
- [ ] Ensure database constraints or transaction logic prevent overlapping appointments for the same professional.

#### ⚙️ Backend
- [ ] Implement availability algorithm in `lib/availability.ts`:
  - Calculate discrete time slots based on `workingHoursStart`, `workingHoursEnd`, and `slotDuration`.
  - Filter out slots in the past.
  - Query existing active appointments (`CONFIRMED` or `PENDING`) for that date and subtract booked slots.
- [ ] `GET /api/professionals/:id/availability?date=YYYY-MM-DD`: Return array of available time slot strings (e.g., `["09:00", "09:45", "10:30", "14:00"]`).
- [ ] `POST /api/appointments`: Create appointment booking:
  - Check in a database transaction that the requested time slot is still open.
  - If open, insert appointment with status `CONFIRMED`.
  - If conflicting, return HTTP 409 Conflict.

#### 💻 Frontend
- [ ] Build `BookingCalendar.tsx` component (date selector allowing user to pick upcoming dates).
- [ ] Build `TimeSlotPicker.tsx` component (renders clickable chips for available hours; shows loading skeleton while fetching).
- [ ] Build `BookingModal.tsx` / checkout step:
  - Displays selected service, price, duration, date, and time.
  - Inputs for client name, phone number, and optional appointment notes.
  - "Confirm Booking" button with loading spinner.
- [ ] Build Booking Success confirmation screen with summary and "Add to Dashboard" link.

### ✅ Acceptance Criteria
- Client only sees time slots that fall within working hours and are NOT already booked.
- Booking a slot locks it; refreshing the calendar immediately shows that slot as unavailable.
- Two users attempting to book the same slot concurrently results in the second user receiving a friendly conflict error.

---

## 📌 Issue #6: [Dashboard] Appointments Management (View, Reschedule, Cancel)

### 📋 Description
**User Story 5:** As a client or professional, I want to view my upcoming appointments on a central dashboard, with the ability to reschedule or cancel if necessary.

- **Priority:** P0 / P1
- **Labels:** `dashboard`, `appointments`, `backend`, `frontend`, `p0`

### 🛠️ Implementation Tasks
#### 🗄️ Database
- [ ] Support status transitions: `PENDING` → `CONFIRMED` → `COMPLETED` or `CANCELLED`.
- [ ] Store `cancelledAt` and optional `cancellationReason`.

#### ⚙️ Backend
- [ ] `GET /api/appointments`:
  - If authenticated user is a `PROFESSIONAL`, return appointments where `professionalId = user.id`.
  - If authenticated user is a `CLIENT`, return appointments where `clientId = user.id`.
  - Support query filter `?status=upcoming|past|cancelled`.
- [ ] `PATCH /api/appointments/:id`:
  - Update status (`CONFIRMED`, `COMPLETED`, `CANCELLED`).
  - Reschedule: update `scheduledAt` and `endTime` (validating that the new slot is available).
- [ ] `DELETE /api/appointments/:id`: Cancel appointment and release the reserved time slot.

#### 💻 Frontend
- [ ] Create Dashboard view at `app/dashboard/appointments/page.tsx`.
- [ ] Add tab filters: **Upcoming Appointments**, **Past History**, and **Cancelled**.
- [ ] Build `AppointmentCard.tsx`:
  - Client name, service title, price, date & time badge, and status pill.
  - Action buttons: "Reschedule" and "Cancel Appointment".
- [ ] Build `RescheduleModal.tsx` (re-uses `BookingCalendar` and `TimeSlotPicker` to pick a new date/time).
- [ ] Build `CancelModal.tsx` with confirmation prompt and reason textarea.
- [ ] Add empty states for each tab when no appointments exist.

### ✅ Acceptance Criteria
- Professional sees all client bookings; client only sees their own bookings.
- Cancelling an appointment updates the status to `CANCELLED` and makes that slot available on the booking calendar.
- Rescheduled appointment updates the date/time and frees the previously occupied slot.

---

## 📌 Issue #7: [UX & Quality] Responsive UI Polish, Loading States, Empty States & Form Validations

### 📋 Description
Implement a polished, responsive user experience meeting WDD430 quality standards: mobile-first responsiveness, loading skeletons, error boundaries, and accessible empty states.

- **Priority:** P1
- **Labels:** `ux`, `frontend`, `polish`, `p1`

### 🛠️ Implementation Tasks
#### 💻 Frontend
- [ ] Mobile-first responsive audit: ensure all tables and grids collapse cleanly on screens `< 768px`.
- [ ] Create `loading.tsx` skeletons for:
  - Landing page
  - Public profile booking page
  - Dashboard appointments table
- [ ] Implement `error.tsx` boundary components with friendly recovery buttons.
- [ ] Add form validations with clear error messages using React Hook Form + Zod.
- [ ] Build informative empty states with call-to-action buttons for:
  - Professional with no services yet -> *"Create your first service"* button.
  - Client with no bookings -> *"Browse professionals"* button.
  - Day with no available slots -> *"Select another date"* message.

### ✅ Acceptance Criteria
- All forms show instant visual validation before submission.
- Zero horizontal scrollbars or layout breakage on mobile viewports (375px+).
- Page transitions display smooth skeleton loaders without layout shifts.

---

## 📌 Issue #8: [Future Enhancements] WhatsApp Confirmation Links & Calendar Export (.ics)

### 📋 Description
Add value-added capabilities tailored for small businesses in local markets (Zimbabwe / worldwide): one-click WhatsApp appointment notifications and `.ics` calendar download.

- **Priority:** P2
- **Labels:** `enhancement`, `whatsapp`, `calendar`, `p2`

### 🛠️ Implementation Tasks
#### ⚙️ Backend & Frontend
- [ ] Implement WhatsApp link generator (`lib/whatsapp.ts`):
  - Generates `https://wa.me/<phone>?text=Hi%20<name>,%20your%20appointment%20for%20<service>%20is%20confirmed%20for%20<date>%20at%20<time>`.
- [ ] Add "Send WhatsApp Confirmation" button to the professional's appointment card.
- [ ] Implement iCalendar export (`.ics` file generation) in `app/api/appointments/:id/ics/route.ts` so clients can add the event to Google Calendar or Apple Calendar.

### ✅ Acceptance Criteria
- Clicking "WhatsApp Confirmation" opens WhatsApp Web or app with pre-filled appointment details.
- Clicking "Add to Calendar" downloads a valid `.ics` file that imports into calendar apps.

---

## 👥 Suggested Team Task Distribution (WDD430)

| Team Member | Primary Focus Areas | Assigned Issues |
| :--- | :--- | :--- |
| **Sthephani Platero** | Project Architecture, Services CRUD & Dashboard Views | **#1, #3, #6** |
| **Halia Yayra Khayat** | Authentication, Role Management & Route Protection | **#1, #2** |
| **Anisa Chokwenda** | Professional Public Profiles & Working Schedule Management | **#4, #7** |
| **Habyarimana Cassien** | Booking Engine, Availability Algorithm & Slot Concurrency | **#5, #8** |
