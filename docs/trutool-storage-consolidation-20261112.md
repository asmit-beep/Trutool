# TruTool storage consolidation — preservation checklist (2026-11-12)

**STATUS: inventory complete; transfer and data copying NOT yet executed.**
This document is intentionally on a non-production branch. Do not decommission any source until every acceptance check below passes.

## Verified sources (read-only)

| Source | Project/store | Verified inventory |
| --- | --- | --- |
| Live Supabase | `jbhifpklfxbixnutklfv` (org `zdnxhgkepalvtkbjbnzk`, current Free, ap-south-1) | 89 `trutool_objects` rows: 56 cms keys, 27 enquiry keys, 6 newsletter keys. The canonical `cms/content-v1.json` has 13 CMS records and 29 activity entries. A private `trutool-media` bucket exists with 0 files. |
| Historic Supabase | `ztuxluvdnmbaushajshm` (org `ttcemnrmhpgmrtbflncd`, ap-south-1) | 0 `trutool_objects` rows, 0 auth users, 29 `trutool-media` Storage objects totalling 2,208,504 bytes. |
| Vercel Blob | `store_y0YTE2z6DwXso4Zx` (private, region bom1) | 104 objects, approximately 1,287,459 bytes. The Blob store is *active*. |
| Destination organization | `iezquttwzpaixzjutnwl` (`asmit@nakama.in's Org`) | Supabase Pro. |

The live project's 29 `cms/media/*` rows are **metadata pointers** for legacy media; the bytes have not been copied into live Storage. Do not mistake the metadata for migrated images.

## Important code paths

- `lib/private-storage.ts`: `enquiries/*` and `cms/media/*` use **Vercel Blob first**, even with `TRUTOOL_STORAGE_BACKEND=supabase`. Other keys use `trutool_objects` and Storage.
- `lib/cms-overlay.ts`: writes and reads the private `cms/independent-publishing-v1.json` **directly via @vercel/blob**; this may contain recent independent editorial changes.
- `lib/cms-store.ts`: merges canonical Supabase CMS content with the separate Blob overlay. Naive replacement of the overlay would lose edits/drafts.
- `app/api/admin/enquiries/route.ts`: admin inbox merges Blob and Supabase enquiry records.
- `app/api/admin/media/route.ts` and `app/media/[id]/route.ts`: CMS image uploads and reads need replacement after copying media.

## Safe sequence

1. **Transfer, don't clone:** in Supabase project `jbhifpklfxbixnutklfv`, Project Settings → General → Transfer project to org `iezquttwzpaixzjutnwl`. The project URL and keys should remain the same. The source-org owner must be a member of the destination org.
2. Recheck the live project is in target org and remains healthy; verify 89 rows, 13 canonical CMS records, and role/RLS/API policies.
3. Make an immutable source inventory: enumerate every Vercel Blob page, record pathname/bytes/ETag/hash where possible, and export ALL objects, including the independent CMS overlay, drafts, enquiry receipt updates, media and any logs.
4. Independently read all 29 old Supabase Storage files and compare bytes/hash with their destination copies. Preserve original keys (such as `cms/media/<uuid>.webp`), check image decoding and metadata. Do not delete the original bucket on metadata-only confirmation.
5. Merge Vercel Blob JSON objects into Supabase without overwriting the 89 existing rows on collisions: distinguish identical, newer, and conflicting versions. Preserve every revision and activity item; resolve conflicted CMS paths deliberately. Copy Vercel media bytes to private Supabase Storage and validate content hashes.
6. Change `private-storage.ts` to Supabase only for **all** paths, including `enquiries/*` and `cms/media/*`. Change `cms-overlay.ts` to the same Supabase backend. Remove runtime direct `@vercel/blob` imports. Retain conditional-write/versioning semantics for the editorial overlay.
7. Stage and verify the app with the destination data: homepage, categories, tool pages, all CMS guides/comparisons/alternatives, all article slugs and canonical URLs, admin CMS drafts/publishing/updates, private enquiry inbox, newsletter, contact/product submissions, uploads and image rendering, cron jobs, sitemap, RSS and feeds. Test a new write, read, revalidation, and rollback.
8. Switch production only after matching counts/path manifests and successful end-to-end tests. Monitor for errors and old-backend requests; perform a final delta copy for writes during cutover.
9. **Only then** disconnect/delete the Vercel Blob store and old Supabase project. Deleting the old project before verifying its 29 media objects is prohibited. The Next.js application may remain hosted on Vercel; this task removes Vercel **storage**, not Vercel hosting.

## Hard pass/fail conditions

- No source-only blob or historical media pathname unaccounted for.
- Actual bytes/hash match; matching filenames and metadata are insufficient.
- Public content inventory and authored revisions are equal or demonstrably reconciled, not just `cms/content-v1.json`.
- 100% of public article images that are referenced resolve; no broken private image endpoints.
- New submissions, newsletter writes, editorial saves, scheduled jobs and direct admin actions work against Supabase without a Blob token.
- Production environment and preview branches contain no remaining old Supabase URLs/keys, Blob tokens or dual-backend fallback.
- Explicitly record each deletion after checks, including project/store IDs and confirmed absence; never label the project migrated before this.

## Risk note

A Free-to-Pro organization transfer can change billing for the destination organization (each project has dedicated compute). Avoid provisioning a duplicate project when transfer preserves existing data. Do not handle secrets in repository files or logs.
