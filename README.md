# KomekHub

KomekHub is a multilingual volunteering platform for Kazakhstan. Volunteers can discover opportunities, apply, track hours, and receive verified certificates. Organizations can publish opportunities, manage applications, confirm completed work, and issue certificates.

The interface is available in English, Russian, and Kazakh.

## Features

- Supabase Auth with volunteer and organization roles
- Supabase-backed opportunities, organizations, profiles, applications, saves, notifications, and certificates
- Search and filters for city, category, format, schedule, age, language, and badges
- Volunteer profile with interests, skills, education/workplace, application history, hours, and certificates
- Birth-date eligibility checks for age-restricted opportunities
- Organization dashboard for opportunity and application management
- Transaction-safe volunteer-hour updates
- Client-side branded certificate PDF generation
- Public certificate verification by certificate number
- Responsive EN/RU/KZ interface with persisted language selection
- Row Level Security policies for user and organization data

## Tech Stack

- React 19 and TypeScript
- Vite 7
- Tailwind CSS 3
- Supabase Auth, Postgres, RLS, and RPC functions
- jsPDF for certificate downloads
- Lucide React icons

## Environment Variables

Copy `.env.example` to `.env.local` and set the public Supabase project values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the Supabase anon key only. Never place a service-role key in a Vite environment variable because all `VITE_*` values are exposed to the browser.

## Local Setup

Requirements: Node.js 20 or newer and a Supabase project.

```bash
npm install
npm run dev
```

The development server runs on `http://127.0.0.1:5173` by default and selects another port if that port is busy.

## Supabase Setup

### New project

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/schema.sql`.
3. Create at least one user through Authentication or the KomekHub sign-up page.
4. Run `supabase/seed.sql` to add the repeatable demo dataset of 8 organizations and 18 opportunities.
5. In Authentication settings, add local and deployed URLs to the allowed redirect URLs.

`schema.sql` contains the current tables, indexes, RLS policies, triggers, and RPC functions required by the app.

### Existing project

Apply the idempotent SQL fixes in this order. Files that were already applied can be run again safely.

1. `supabase/profile_auth_fix.sql`
2. `supabase/profile_birth_date_fix.sql`
3. `supabase/opportunity_status_fix.sql`
4. `supabase/opportunity_age_fix.sql`
5. `supabase/application_fields_fix.sql`
6. `supabase/action_policies_fix.sql`
7. `supabase/organization_dashboard_policies.sql`
8. `supabase/volunteer_hours_fix.sql`
9. `supabase/notifications_fix.sql`
10. `supabase/certificate_system_fix.sql`
11. `supabase/seed.sql` if demo data is required

The seed is repeatable, uses fixed UUIDs, and does not delete user-created records. It prints a notice and exits cleanly when no Auth user exists.

## Build

```bash
npm run build
npm run preview
```

`npm run build` performs TypeScript checking before creating the production bundle in `dist/`.

## Deployment

### Vercel

1. Import the GitHub repository into Vercel.
2. Keep the framework preset as Vite.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Project Settings > Environment Variables.
4. Deploy. `vercel.json` provides the SPA rewrite required for direct visits to routes such as `/opportunities`, `/profile`, and `/verify`.
5. Add the Vercel domain to Supabase Auth redirect URLs.

Any static host must serve `index.html` as the fallback for unknown application routes.

## Screenshots

The main QA views are:

- Home and featured opportunities
- Opportunity marketplace with filters
- Volunteer profile and certificates
- Organization dashboard and application management
- Public certificate verification

Add release screenshots under `docs/screenshots/` when preparing public launch materials.

## Project Structure

- `src/components` reusable layout and UI components
- `src/pages` public, volunteer, auth, and organization views
- `src/services` Supabase queries and mutations
- `src/i18n` EN/RU/KZ translations and stable-value labels
- `src/data` static filter and category constants only
- `src/types` shared TypeScript models
- `src/utils` formatting, PDF, and utility helpers
- `supabase` complete schema, idempotent upgrades, policies, and seed data

Real opportunities and organizations are always loaded from Supabase. `src/data/mockData.ts` is used only for static UI constants and initial filter values.

## Future Improvements

- Avatar and organization-logo uploads with Supabase Storage
- Email and push notification delivery
- Moderation and organization verification workflows
- Certificate QR codes and shareable public certificate URLs
- Automated end-to-end tests against a dedicated Supabase test project
- Analytics, audit logs, and accessibility regression checks
