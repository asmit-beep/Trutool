# TruTool: non-destructive Supabase → Vercel Blob backup (NOT a cutover)

Status as of 2026-10-27: **NOT EXECUTED**. Supabase reports Fair Use HTTP 402; the source storage API and media reads must succeed before copying.

## Non-negotiable rules

1. Keep Supabase project `ztuxluvdnmbaushajshm` intact, including its users, CMS records, enquiries, and all storage objects. November 11 is the expected reset date reported by the owner; verify service restoration, do not assume it.
2. Do not delete, truncate, rewrite, migrate ownership of, or deactivate Supabase.
3. Do not change `TRUTOOL_STORAGE_BACKEND` production (`supabase`) before a full data-reconciliation, media check, preview test, and explicit independent production approval.
4. Keep the existing Vercel Blob store `store_y0YTE2z6DwXso4Zx` and all its pre-existing root objects. Backup copies are **only** written to unique `migration-snapshots/<run-id>/objects/` paths, with `allowOverwrite:false`.
5. Never send a Supabase secret key or Vercel Blob token to source control, user-visible logs, Slack, or chat.

## Source inventory observed on October 27, 2026

- Supabase project is reported `ACTIVE_HEALTHY` at the database layer, while REST and media are subject to 402.
- 89 entries in `public.trutool_objects`:
  - 1 CMS content document (contains published/draft records and activity)
  - 29 media metadata entries
  - 27 enquiries
  - 6 newsletter records
  - 26 historical admin login-limit counters
- 29 physical media objects (about 2,208,504 bytes) in `storage.objects`, bucket `trutool-media`.
- JSON metadata payload total about 424,741 bytes.
- Existing Vercel private Blob store: 21 objects, about 18,597 bytes. **Do not treat it as a completed migration.**
- Counts are a baseline only: new enquiries or publications could change them. Use current counts and content hashes during migration.

## Phase A: recover access and preflight (no writes)

After HTTP 402 clears, run in a trusted environment with existing securely provisioned variables:
```sh
node scripts/stage-supabase-blob-backup.mjs
```
The script:
- validates the **exact** source Supabase project and destination Blob store IDs;
- retrieves *all* entries in the database object inventory and the real bytes of *every* media object;
- refuses missing/invalid CMS, duplicate paths, inaccessible media, any unexpected storage path, or restricted HTTP responses;
- emits counts only; it does not log private content.

## Phase B: immutable duplicate and verify (copy only)

Only after the preflight succeeds:
```sh
node scripts/stage-supabase-blob-backup.mjs --copy
```
The script writes under a new snapshot prefix (not the live `cms/` keyspace), verifies every saved object's content SHA-256 and length, then writes `verified-manifest.json` **last**. If any check fails, the snapshot is incomplete and is not a valid cutover source. There is no source deletion or overwriting.

## Phase C: reconcile before any production change

- Read the snapshot manifest and confirm all source paths and SHA-256 checksums are represented.
- Inspect the pre-existing 21 Blob objects, including any older CMS document, and preserve anything unique. Do not blindly overwrite them with the Supabase copy.
- Confirm all 29 media files are usable at their intended `/media/<id>.webp` URLs.
- Compare CMS revision, document record count, draft/published/scheduled flags, redirects and paths, latest activity, author pages, community content, newsletter subscriptions, and enquiries.
- Confirm new writes will be accepted and persisted without affecting Supabase.
- Test a *separate preview* in Vercel for admin sign-in, create/save/publish/unpublish, file upload, homepage, guides, tool profiles, everything-ai feed, sitemap.xml, robots and cache revalidation.
- Confirm Blob quota/limits and monitor costs (the Vercel Blob plan is not guaranteed to be costless at unlimited scale).

## Phase D: production cutover (NOT AUTOMATIC)

Only after the verified complete copy, reconciliation and user approval:
- prepare a reversible release that selects the Vercel Blob backend but **retains Supabase configuration, database, tables, and media unchanged**;
- ensure a rollback can return to Supabase without losing writes made after the cutover (dual-write or a tested back-sync is necessary);
- deploy with a short maintenance/freeze window if consistency requires it;
- test real authenticated Studio reads/writes, media, enquiries, and public URLs, then monitor errors.
  
**No cutover, deletion, upgrade, billing change, or project transfer is authorized by this document.**
