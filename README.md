# TruTool

Independent software and learning directory built with Next.js.

## Development

Run `pnpm install` and `pnpm dev`. Run `pnpm build` for a production build.

## Deployment

The main branch deploys through the linked Vercel project. Set `NEXT_PUBLIC_SITE_URL` to the production origin. Contact submissions are saved as private JSON documents in the dedicated TruTool Vercel Blob store. `BLOB_READ_WRITE_TOKEN` stays server-only and must be configured for production and preview.

## Content

Profiles, guides, and comparison data are in `lib/catalog.ts`. Vendor logos and article covers are served locally from `public`. Brand provenance is recorded in `asset-sources/brand-logos.json`.
