# KomekHub

A modern volunteer opportunity platform for Kazakhstan, helping people find meaningful ways to support their community.

Built with React, TypeScript, Vite, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

The app is built as a frontend-only product with mock data in `src/data/mockData.ts`.

## Included

- English and Russian UI with persisted language selection.
- Kazakhstan-focused demo data with cities, organizations, categories, languages, certificates, and volunteer hours.
- Home page with hero search, filters, categories, featured opportunities, how it works, and benefits.
- Opportunity list page with sidebar filters, sorting, cards, empty state, save, apply state, and localized toast.
- Opportunity detail page with requirements, responsibilities, benefits, organization info, and similar roles.
- Volunteer profile page for an AITU student with hours, languages, interests, skills, application history, and saved opportunities.
- Organization page with logo, description, rating, published opportunities, and post button.
- Post opportunity form with required-field validation.

## Project structure

- `src/components` reusable UI, layout, search, and opportunity cards.
- `src/pages` app pages.
- `src/data` Kazakhstan mock data.
- `src/i18n` translation structure.
- `src/types` shared TypeScript types.
- `src/utils` small helpers.
