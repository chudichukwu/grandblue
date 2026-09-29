# Phase 2 production foundation

## Phase 1 assessment

Phase 1 is a Next.js App Router application. Routes live in `src/app`, reusable client UI lives in `src/components`, and shared types, calculations, dates, seed content, and persistence live in `src/lib`. Styling uses route and component CSS Modules plus global design tokens. `AppShell` owns navigation and the non-sensitive theme preference. `ProgressProvider` supplies dashboard and check-in data.

The Phase 1 data model is `DailyEntry`, with category minutes, module count, scores, notes, and audit timestamps. Its original repository serialized a versioned `{ version: 1, entries }` envelope under `grand-blue.progress.v1`. This made progress browser-specific, prevented server authorization, and made loss or malformed storage a device-level risk. The dashboard and check-in form consumed that synchronous browser repository through `ProgressProvider`.

## Phase 2 architecture

Postgres is now the source of truth. The client provider talks to same-origin App Router endpoints through a repository interface. API handlers validate payloads with Zod, verify the Supabase user from cookie-based SSR auth, and instantiate repositories scoped to that user. Queries include `user_id`, while database grants and RLS independently enforce ownership.

Supabase sessions are stored in cookies through `@supabase/ssr`. Next.js 16 `proxy.ts` refreshes verified claims and protects application and API routes. Auth pages, the callback, email verification, and password recovery remain public.

The former localStorage key is read only by the migration prompt. The importer validates the entire envelope, upserts normalized rows with stable import IDs, reports individual failures, marks the profile after complete success, and only then removes the local copy. The theme remains in localStorage as a non-sensitive UI preference.

Schema changes are defined exclusively in `supabase/migrations`. Every exposed user table has `user_id`, RLS enabled and forced, anon grants revoked, authenticated grants constrained, and separate SELECT, INSERT, UPDATE, and DELETE policies. Composite foreign keys prevent a user-owned child row from referencing another user's parent row.
