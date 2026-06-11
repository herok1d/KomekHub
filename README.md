# KomekHub

A modern volunteer opportunity platform for Kazakhstan, helping people find meaningful ways to support their community.

Built with React, TypeScript, Vite, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Create a `.env.local` file with your Supabase project values:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app fetches opportunities and organizations from Supabase. The database schema and demo seed are in `supabase/schema.sql` and `supabase/seed.sql`.

`src/data/mockData.ts` is kept only for static UI constants such as categories, filter options, badge options, and initial filters. It is not used as the source for real opportunities or organizations.

For an existing Supabase project created before the automatic auth profile trigger was added, run `supabase/profile_auth_fix.sql` once in the Supabase SQL Editor. It installs the profile RLS policies, creates profiles for new auth users, and backfills missing profiles for existing users.

`supabase/seed.sql` is repeatable and uses fixed UUIDs with upserts. Once at least one Supabase Auth user exists, run it in the SQL Editor to insert or refresh the 8 demo organizations and 18 demo opportunities without deleting user-created data.

For an existing project, run `supabase/action_policies_fix.sql` once to enable the saved-opportunity and application RLS policies used by the frontend.

Run `supabase/organization_dashboard_policies.sql` once to enable organization-owned opportunity management, application status updates, and limited applicant profile reads.

Run `supabase/volunteer_hours_fix.sql` once to install the transactional application-status RPC that keeps volunteer profile hours synchronized without double-counting.

## Included

- English and Russian UI with persisted language selection.
- Supabase-backed opportunities and organizations with joined organization data.
- Kazakhstan-focused category, city, language, badge, and schedule filters.
- Home page with hero search, filters, categories, featured opportunities, how it works, and benefits.
- Opportunity list page with sidebar filters, sorting, cards, empty state, save, apply state, and localized toast.
- Opportunity detail page with requirements, responsibilities, benefits, organization info, and similar roles.
- Supabase-backed volunteer profile with editing, hours, languages, interests, skills, application history, and saved opportunities.
- Public organization directory plus an organization-only dashboard for profile setup, opportunity management, and application review.
- Supabase-backed create and edit opportunity forms with required-field validation.

## Project structure

- `src/components` reusable UI, layout, search, and opportunity cards.
- `src/pages` app pages.
- `src/data` static UI constants for filters and categories.
- `src/services` Supabase client, services, and database row mappers.
- `src/i18n` translation structure.
- `src/types` shared TypeScript types.
- `src/utils` small helpers.
