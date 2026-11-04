# Account unification

Account connections live inside each app's existing account panel. The portrait and name sit beside provider rows, the unconnected provider has `연동하기`, and connection status stays below. There is no separate settings page. Transient errors and completion messages appear in a separate, automatically dismissed toast without changing the panel height.

A verified Google/GitHub identity maps through `account_memberships` to one canonical application profile. Auth users are retained. Connecting keeps the initiating profile/name/email/role. An administrator must initiate from the admin account. One identity per provider is allowed by the connection workflow. Supabase's own automatic same-email identity linking may already have connected a provider; that is treated as an already-connected account, not a second merge.

## Runtime contract

Each app exposes `/api/accounts?op=status|start|callback|preview|confirm|cancel`. Start/confirm/cancel require same-origin POST. The original session is remotely verified; a 10-minute operation binds the initiating Auth ID, session ID, origin, provider, and a SHA-256 hash of a random HttpOnly-cookie secret. The isolated PKCE callback never installs the secondary session in the browser. Callback returns to `/?link=review`, opening the same account panel.

Only trusted server credentials may call account SQL helpers. Public tables retain policy-free RLS. Backend application ownership resolves to the canonical profile; Auth verification still uses the real login identity. Public leaderboard queries batch private profile reads and mask email before returning results.

Merge preview covers profile permissions, membership, saves, counters and owned data counts. Confirmation rechecks its fingerprint under an exclusive database write fence; normal writes share that fence and remain concurrent. Confirmation is idempotent until operation expiry. Incomplete operations expire after 10 minutes and are cleaned on the next start; audit rows keep IDs/time/save choice without tokens or save copies.

Blog authorship and deletion attribution transfer. Likes deduplicate. Dice results transfer, achievements union with earliest duplicate evidence, full-kit takes the maximum and class aggregates are recalculated. Existing signed runs and queued achievement submissions continue through verified membership aliases.

For two Bulmeong saves, the user chooses one whole save, including inventory and personal-record state. Account version advances beyond both prior versions. Old clients receive `account_reload_required`; they reload the chosen cloud save without importing old local progress. The known personal-record schema is supported; unexpected layouts stop the merge.

## Deployment order

1. Back up the shared database using the owner's normal secure backup procedure and verify restore access. Do not store dumps or credentials in these repositories.
2. Apply the two new mublog migrations in order: `20261104110000_bulmeong_personal_records` (the existing game migration, now in central history), then `20261104120000_account_unification`. If personal records were already installed manually, reconcile migration history using the established Prisma workflow after verifying identical SQL; do not blindly reapply or reset the database.
3. Generate Prisma Client as part of the blog build. Deploy all three compatible app versions with both flags off initially. Verify ordinary login/save behavior.
4. Set `ACCOUNT_UNIFICATION_ENABLED=true` on all three deployments. This enables canonical ownership and version-aware saves. Confirm session/load responses and public leaderboard behavior. Do not enable linking until all three deployments are ready.
5. Add each app's exact OAuth callback `https://<app-origin>/api/accounts?op=callback&connection=*` to Supabase's redirect allowlist (use the documented wildcard syntax for the connection query; keep the scheme/host/path restricted). Existing normal-login callbacks remain required. For local tests, use a separate test project and localhost callback, not production accounts.
6. After reviewing the local account-panel UI and passing isolated OAuth integration tests, set `ACCOUNT_LINKING_ENABLED=true` for all apps. Configured `GAME_ORIGIN` / `NEXT_PUBLIC_SITE_URL` must equal the app's actual origin, without a trailing slash.
7. Test disposable Google/GitHub accounts with different emails and existing data in an isolated environment before any real-user merge. Verify both logins access the same data across all apps.

To stop rollout, disable `ACCOUNT_LINKING_ENABLED`. Keep `ACCOUNT_UNIFICATION_ENABLED` and compatible code enabled after any merge. Reverting to raw Auth-ID ownership would split users again. Auth-user deletion is deliberately restricted by membership foreign keys; account deletion/disconnection is outside this release.

## Checks and limits

- `node scripts/verify-account-ui.mjs`: real browser-script click handlers, OAuth start, disabled gate, failed save, error toast placement and automatic dismissal.
- `yarn tsx scripts/verify-account-flow.mts`: same-origin/method guards, PKCE, binding, isolated session cookies, feature gate and exact cross-app protocol/asset parity.
- `yarn tsx scripts/verify-account-merge.mts`: isolated PGlite transactions, replay, preview invalidation, save selection, record state, privileges, provider conflicts, rollback, ACL and alias writes.
- Dice: existing suite plus signed-ticket alias validation; Bulmeong: `node tests/account-merge-client.test.mjs` and existing record tests.
- A local PostgreSQL 18 instance restored from the production PostgreSQL 17 backup passed the migration and eight rolled-back account merge cases. Two independent connections verified that shared write locks coexist and an exclusive merge lock waits until writers release it. This checks the write fence, not all possible concurrent operations.
- Live OAuth provider exchange still requires user-driven integration verification. Neither these tests nor PGlite establish production performance.

The framework-neutral core and browser assets are deployment copies in each game repository, with mublog as their source. Update and parity-test all copies together. Merge semantics remain in the central SQL migration, not in three separate implementations.
