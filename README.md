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

## Included

- English and Russian UI with persisted language selection.
- Supabase-backed opportunities and organizations with joined organization data.
- Kazakhstan-focused category, city, language, badge, and schedule filters.
- Home page with hero search, filters, categories, featured opportunities, how it works, and benefits.
- Opportunity list page with sidebar filters, sorting, cards, empty state, save, apply state, and localized toast.
- Opportunity detail page with requirements, responsibilities, benefits, organization info, and similar roles.
- Volunteer profile page for an AITU student with hours, languages, interests, skills, application history, and saved opportunities.
- Organization page with logo, description, rating, published opportunities, and post button.
- Post opportunity form with required-field validation.

## Project structure

- `src/components` reusable UI, layout, search, and opportunity cards.
- `src/pages` app pages.
- `src/data` static UI constants for filters and categories.
- `src/services` Supabase client, services, and database row mappers.
- `src/i18n` translation structure.
- `src/types` shared TypeScript types.
- `src/utils` small helpers.
