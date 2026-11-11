<!--
Sync Impact Report:
- Version change: 1.0.0 (Initial Ratification)
- Project: Viable Appointment Scheduler
- Tech Stack: Next.js (App Router), TypeScript (Strict), Tailwind CSS, Auth.js v5
-->

# Viable Appointment Scheduler Constitution

## Core Principles

### I. TypeScript Strict Mode & Type Safety
All code must be written in TypeScript with `strict: true`. The use of `any` is strictly prohibited. All data structures, API responses, form inputs, and component props must have explicit, well-defined types or interfaces. Prefer Zod schemas for runtime schema validation on both client forms and server actions/route handlers.

### II. Utility-First Tailwind CSS
Styling must adhere to Tailwind CSS utility classes. Custom CSS files and inline styles are prohibited unless specifically needed for 3rd-party integration or complex keyframe animations. The application must feature a cohesive design system (defined color palette, typography scale, responsive breakpoints, loading skeletons, and accessible empty states).

### III. Next.js App Router Architecture
Leverage Next.js App Router patterns cleanly:
- **Server Components by Default**: All pages, layouts, and data-fetching components must be React Server Components (RSC) to maximize performance and SEO.
- **Client Components on Demand**: Use `'use client'` only at the leaves of the component tree where user interactivity, React hooks (`useState`, `useEffect`), or browser APIs are required.
- **Colocation & File-based Routing**: Utilize route groups, error boundaries (`error.tsx`), loading states (`loading.tsx`), and metadata for SEO.

### IV. Component & Code Architecture
- Code must follow single-responsibility principles: separate presentation from business logic and data access.
- Component names must be in PascalCase (`BookingCard.tsx`), utilities and hooks in camelCase (`useAvailability.ts`, `formatDate.ts`), and route folders in kebab-case or standard Next.js conventions.

### V. Team Collaboration & Quality Gates
- Every pull request must be reviewed and pass linting (`npm run lint`) and TypeScript checks before merging into `main`.
- Features are implemented following the prioritized specifications (P0 before P1, P1 before P2).

## Governance
This Constitution establishes the non-negotiable coding and architectural standards for the development team. Any architectural changes must be discussed and agreed upon by the team members (Sthephani, Anisa, Habyarimana).

**Version**: 1.0.0 | **Ratified**: 2026-11-04 | **Last Amended**: 2026-11-04
