# Publishing on TruTool

The published catalogue is the single source for tool counts, category totals,
search, comparisons, alternatives, diagnostics, and the sitemap. Adding an
approved entry and pushing it to `main` starts the existing Vercel deployment.
There is no separate count or search-index file to maintain.

## Add a tool

Add an entry to `lib/expanded-catalog.json` under `tools`. Use a unique slug,
existing category slug, official HTTPS URL, name, concise summary, buyer fit,
features, an evaluation caution, format, pricing status, colour, and initial.
Use the existing entries as the schema. Do not invent ratings or verification.
Supply `updatedAt` (ISO date) when the profile has been reviewed.

Add a local brand mark to `public/brands` and its mapping to
`lib/catalog-brand-assets.json` when available. Otherwise the existing logo
endpoint tries the official vendor domain and falls back to the product initial.

## Add a category

Add its unique slug, name, short label, description, icon, colour, buyer question,
and answer to `lib/expanded-catalog.json` under `categories`, with at least one
associated tool. It automatically appears in navigation, the directory filters,
category index, diagnostic category choices, and sitemap. Core categories live
in `lib/catalog.ts` and take precedence over an expanded entry with the same slug.

## Publish a guide

Add an entry to `additionalGuides` in `lib/guides.ts`: unique slug, category,
title, intro, evaluation checks, question, answer, `publishedAt` (ISO date), and
`updatedAt` when revised. These dates must describe actual publication/revision.
The guide count, guide index, newest four homepage previews, route, and sitemap
update automatically. Covers currently follow the category cover mapping in
`components/guide-card.tsx`. Existing launch guides default to 5 October 2026.

## Checks and publication

Run `npm run typecheck`, `npm run lint`, and `npm run build` before publishing.
The build automatically checks duplicate slugs, valid categories, guide dates,
comparison references, source fields, logo files, and search results. It also
checks that adding a tool/category/guide updates the counts, search and sitemap.

Push approved content to GitHub `main`. Vercel builds the pages and atomically
publishes the new catalogue. Search responses are cached for up to five minutes;
existing open browser tabs refresh a repeated query after 30 seconds. Reload a
page to see the newly deployed catalogue immediately. Product submissions and
reviews remain moderated; submitting a form does not publish an unreviewed entry.

## Client presentation content

`lib/demo.ts` controls the placeholder reviews used for the client presentation. They never enter the moderated inbox or the approved review file. There is no visible presentation banner. Set `NEXT_PUBLIC_DEMO_MODE=false` and redeploy for the organic launch; this removes the placeholder ratings and reviews and permits search indexing. Do not add placeholder ratings to structured review data.

Approved tool and guide reviews belong in `lib/community-reviews.json`. Each record needs a unique `id`, `kind` (`tool` or `guide`), a valid catalogue `slug`, `name`, integer `rating` from 1 to 5, `message`, and ISO `publishedAt` date. Publish only the moderated public fields; keep email addresses private. Counts and averages update from these records on the next deployment.

An optional verified `pricingUrl` on a tool overrides the checked pricing destinations in `lib/pricing.ts`. Unconfirmed destinations link to the official vendor website rather than guessing a pricing path.
