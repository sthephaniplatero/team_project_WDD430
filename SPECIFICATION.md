# Viable Appointment Scheduler

## Project Title & Description
**Viable Appointment Scheduler** is a clean, accessible booking platform designed for independent solo professionals (such as tutors, therapists, consultants, and coaches) and their clients. The application allows professionals to create a verified public profile, configure working hours, and manage their service offerings. Clients can discover professionals, browse services, check real-time availability, and schedule appointments in seconds.

The project addresses a critical real-world business problem in emerging markets worldwide, where solo entrepreneurs lose clients and waste hours manually juggling bookings through unstructured WhatsApp messages, phone calls, and paper notebooks. The MVP focuses on core booking, profile management, and appointment tracking workflows.

## Purpose & Target Audience
- **Target Audience:**
  - **Solo Professionals & Service Providers:** Independent tutors, consultants, fitness trainers, and therapists needing a frictionless, professional booking presence without enterprise software complexity.
  - **Clients & Students:** Individuals looking to view service offerings, verify availability, and schedule or manage appointments with immediate confirmation.
- **Purpose:**
  - Modernize appointment scheduling for micro-businesses by replacing manual WhatsApp/call coordination with an automated, professional web booking system that eliminates double-booking and missed appointments.

## User Stories
1. **As a user (professional or client),** I want to create an account and log in securely so that I can access my personalized dashboard and manage my bookings.
2. **As a professional,** I want to create, edit, and delete services (title, duration, price, description) so that prospective clients know exactly what I offer.
3. **As a professional,** I want to set up my public profile (bio, working days/hours, contact details) so that clients can learn about my qualifications and schedule.
4. **As a client,** I want to visit a professional's public page and view available dates and time slots so that I can choose a time that fits my schedule.
5. **As a client,** I want to book an appointment for a specific service so that the time slot is reserved and recorded in the system.
6. **As a professional or client,** I want to view my upcoming appointments on a dashboard so that I can keep track of my schedule.
7. **As a client or professional,** I want to reschedule or cancel an existing appointment so that both parties are notified and the calendar slot is freed up.

## Acceptance Criteria

### Story 1: Authentication and Profile Creation
- **Given** a new user visiting the signup page, **when** they submit valid credentials (name, email, password, role), **then** the system registers the account and establishes an authenticated session via Auth.js.
- **Given** an existing email address or an invalid password format, **when** registration is attempted, **then** the system displays a clear inline error message and keeps form inputs intact.

### Story 2: Manage Services (CRUD)
- **Given** an authenticated professional on their services management page, **when** they submit the "Create Service" form with title, duration (minutes), price, and description, **then** the new service is persisted and immediately appears in their service list.
- **Given** a professional editing or deleting an existing service, **when** they save changes or confirm deletion, **then** the service is updated in the database and changes reflect on their public booking page.
- **Given** an incomplete form submission (e.g., missing price or duration), **when** the professional submits, **then** validation errors highlight the required fields and block submission.

### Story 3: View Public Profile and Availability
- **Given** any visitor navigating to a professional's public profile URL (`/professionals/[id]`), **when** the page loads, **then** they see the professional's photo/avatar, bio, listed services, and a date picker.
- **Given** a selected service and date, **when** the client selects a date, **then** the system dynamically renders only time slots within the professional's working hours that are not already booked.
- **Given** a date with no available slots (or a non-working day), **when** selected, **then** the system displays a friendly empty-state message indicating no slots are available.

### Story 4: Book an Appointment (Create)
- **Given** an authenticated client selecting an open time slot, **when** they submit the booking form with optional notes, **then** the appointment is saved with status `CONFIRMED` or `PENDING`, and the time slot is locked to prevent double-booking.
- **Given** two users attempting to book the exact same slot concurrently, **when** the second user submits, **then** the system detects the conflict, rejects the second booking, and prompts them to pick an alternate time.

### Story 5: View and Manage Appointments (Read, Update, Cancel)
- **Given** a logged-in user on their Dashboard (`/dashboard`), **when** they open the "My Appointments" view, **then** they see their bookings sorted chronologically, with status badges (Upcoming, Completed, Cancelled).
- **Given** an upcoming appointment, **when** the client or professional clicks "Reschedule" and picks a new valid time, **then** the booking's scheduled time is updated.
- **Given** an upcoming appointment, **when** either party clicks "Cancel Appointment" and confirms the modal prompt, **then** the status updates to `CANCELLED` and the original slot becomes available again.

## Technical Requirements
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript in strict mode (no usage of `any`)
- **Styling & UX:** Tailwind CSS (utility-first, responsive layouts, defined color palette, form validation styling, loading skeletons, and empty-state illustrations)
- **Authentication:** Auth.js v5 (NextAuth) with session management and role-based access control (`PROFESSIONAL` vs. `CLIENT`)
- **Database & Platform:** Supabase (Managed PostgreSQL) with `@supabase/supabase-js` and `@supabase/ssr`
- **Architecture:** React Server Components (RSC) by default for data fetching and SEO; Client Components (`'use client'`) strictly for interactive forms and calendar picker controls
- **Key Views:**
  1. *Landing Page* (`/`): Value proposition, how it works, and CTA for professionals and clients.
  2. *Public Professional Profile / Booking Page* (`/professionals/[id]`): Professional bio, service menu, interactive calendar, and slot booking.
  3. *Dashboard* (`/dashboard`): Role-based view — appointments calendar, manage services, and account settings.

## Core API Endpoints
- `POST /api/auth/[...nextauth]` — Authentication handlers (login, register, logout, session verification)
- `GET /api/professionals` — List registered professionals with filters (category, search query)
- `GET /api/professionals/:id` — Fetch a single professional's public bio, schedule, and active services
- `PATCH /api/professionals/:id` — Update professional profile information and working hours
- `GET /api/services` — List services belonging to the authenticated professional
- `POST /api/services` — Create a new service offering
- `PUT /api/services/:id` — Update existing service details (name, duration, price)
- `DELETE /api/services/:id` — Remove or archive a service offering
- `GET /api/professionals/:id/availability?date=YYYY-MM-DD` — Retrieve available time slots for a specific date
- `GET /api/appointments` — List appointments for the current authenticated user (client or professional)
- `POST /api/appointments` — Create a new appointment booking
- `PATCH /api/appointments/:id` — Update appointment (reschedule time slot or update status: confirmed/completed/cancelled)
- `DELETE /api/appointments/:id` — Cancel an appointment

## Implementation Priority
- **P0 (Critical MVP):**
  - User sign up, sign in, and session management with Auth.js v5.
  - Professional public profile view (`/professionals/[id]`).
  - Full Services CRUD (Create, Read, Update, Delete services).
  - Core booking flow (view available time slots, submit booking, lock slot against double-booking).
  - Appointments list view on Dashboard (`/dashboard`).
- **P1 (Core Enhancements):**
  - Reschedule appointment and cancellation workflows with slot release.
  - Appointment status management (Pending, Confirmed, Completed, Cancelled).
  - Responsive empty states, loading skeletons, and validation feedback.
  - Client details and booking notes.
- **P2 (Future Extensions):**
  - WhatsApp confirmation message links / automated email reminders.
  - Integration with external calendars (Google Calendar sync / `.ics` export).
  - Client reviews and professional ratings.
  - Online payments integration (EcoCash / Stripe).
