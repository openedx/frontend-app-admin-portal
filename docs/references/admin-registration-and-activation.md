# Admin registration and activation flow

This document describes the two-step flow that gates a new enterprise admin's
first entry into the Admin Portal: `/<enterpriseSlug>/admin/register` and
`/<enterpriseSlug>/admin/register/activate`.

## Routes

- `/<enterpriseSlug>/admin/register` → `AdminRegisterPage`
  (`src/components/AdminRegisterPage/index.jsx`)
- `/<enterpriseSlug>/admin/register/activate` → `UserActivationPage`
  (`src/components/UserActivationPage/index.jsx`)

## Purpose

A newly invited enterprise admin's JWT may not yet reflect their
`enterprise_admin` role and/or their LMS account may not yet be verified
(`is_active=false`). These pages exist to:

1. Force a JWT refresh so the role assignment is picked up.
2. Verify the user actually has access (either `enterprise_admin` scoped to this
   enterprise, or the unscoped `enterprise_openedx_operator` role).
3. Wait/poll for the user to verify their email before letting them into the
   portal proper at `/<enterpriseSlug>/admin/learners`.

## AdminRegisterPage

Entry point. Runs a single sequential async `init()` on mount:

1. `LmsApiService.loginRefresh()` — forces the LMS to mint a fresh JWT cookie
   with current role assignments.
2. `hydrateAuthenticatedUser()` — pulls the fresh JWT data into the in-memory
   `@edx/frontend-platform/auth` cache so subsequent `getAuthenticatedUser()`
   reads see the new roles.
3. `LmsApiService.fetchEnterpriseBySlug(enterpriseSlug)` — resolves the
   enterprise's UUID from the slug.
4. Role check against the hydrated user:
   - `isEnterpriseUser(user, ENTERPRISE_ADMIN, enterpriseUUID)` — admin scoped
     to this specific enterprise.
   - OR `isEnterpriseUser(user, ENTERPRISE_OPENEDX_OPERATOR)` — operators use
     wildcard roles (`enterprise_openedx_operator:*`) that don't match a
     specific UUID, so this check is unscoped.

### Outcomes

| State                                                | Render                                                  |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Unauthenticated                                      | `LoginRedirect` → enterprise proxy login                |
| Pending/rendering (`init()` running)                 | `EnterpriseAppSkeleton`                                 |
| Has admin or operator role                           | `<Navigate replace>` to `/<slug>/admin/register/activate` |
| No qualifying role + `?pending-invited-admin=true` + no session flag | One-shot logout-and-return bounce via `getEnterpriseAdminRegisterLogoutUrl(slug, { 'pending-invited-admin': 'true' })`; session flag set |
| No qualifying role + (param absent OR session flag set) | Terminal warning alert (no bounce)                  |
| Network/lookup failure                               | Terminal error alert with a "sign in again" link built from the same helper |

The terminal alerts are important: earlier versions of this page bounced
*every* non-admin authenticated user back to `getProxyLoginUrl(slug)`. When the
proxy round-trip didn't grant the role, the user looped indefinitely. (Those
versions also skipped the logout step, which is what actually triggers the
admin promotion server-side; see "Pending invited admin bounce" below.)

### Pending invited admin bounce

The admin invite flow in edx-platform doesn't promote an invited user to a
full admin until the User model's `post_save` signal fires, which runs
`enterprise/api/__init__.py::activate_admin_permissions` and creates the
matching `EnterpriseCustomerAdmin` + role assignment from a
`PendingEnterpriseCustomerAdminUser`. The signal fires on Django `login()`
because `login()` writes `last_login` on the User model.

For a pending invited admin clicking an onboarding email link, the
`?pending-invited-admin=true` query param tells this page to do a one-shot
redirect to `getEnterpriseAdminRegisterLogoutUrl(slug, { 'pending-invited-admin': 'true' })`
(see `src/utils.js`). The helper builds the URL via the WHATWG `URL` API:
`${LOGOUT_URL}?next=<URL-encoded BASE_URL/<slug>/admin/register?pending-invited-admin=true>`.
The logout clears the LMS session; on return, `AdminRegisterPage` runs while
unauthenticated, `LoginRedirect` triggers a fresh login, `last_login`
updates, and the User `post_save` signal handler grants the admin role.
A plain proxy-login redirect (without the logout step) short-circuits when
the session is still valid and doesn't trigger the save; the older
`getLogoutRedirectUrl(getProxyLoginUrl(...))` wrapper produced nested URL
encoding that 404'd on the logout view's redirect target. See ADR 0013
for the full reasoning. After re-login, the user comes back here, init()
re-runs, the role is now present, and they continue into
`/admin/register/activate`.

To prevent looping when the proxy round-trip *doesn't* grant the role (bad
invite, race condition, edx-platform error), we set a sessionStorage flag
(`admin_register_proxy_login_attempted_<slug>`) before redirecting. If the
user comes back still without the role, we fall through to the terminal
warning alert. The flag is scoped per-enterprise and per-tab (sessionStorage
clears on tab close), so the next legitimate visit from a new tab can retry
the bounce if needed.

## UserActivationPage

Normally reached via the `<Navigate replace>` from `AdminRegisterPage` after
the role check passes. The route is also directly navigable, so this page
defends itself rather than assuming role gating happened upstream. Handles the
email-verification wait:

- Stores the authenticated user in component state so React re-renders when
  hydration updates `isActive`/`roles`.
- Calls `hydrateAuthenticatedUser()` on mount if the cached user looks stale
  (`!isActive` or empty `roles`), and again every 5s via `useInterval` while
  still stale. Concurrent calls are blocked by a `useRef` in-flight guard;
  errors are caught and `logError`'d.
- When `isActive && roles?.length`, navigates to `/<slug>/admin/learners` and
  shows a success Toast.
- When the user is authenticated but missing `isActive` or roles, renders the
  warning alert ("verify your email to activate your account") rather than
  redirecting away. The empty-roles case used to redirect to
  `/<slug>/admin/register`, which produced the loop described above.

The `roles?.length` guard on the verified-redirect branch matters: a verified
user with no admin role would otherwise be sent to `/admin/learners`, where
they have no access.

## State diagram

```
                  ┌──────────────────────────────────────┐
                  │ /<slug>/admin/register                │
                  │ (AdminRegisterPage)                   │
                  └──────────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────────────┐
              │                 │                         │
              ▼                 ▼                         ▼
       not authed          authed, init() runs       init() errors
              │                 │              (loginRefresh, hydrate,
              ▼                 ▼               or fetchEnterpriseBySlug
       proxy login        loginRefresh →                  throws)
       (LoginRedirect)    hydrate →                       │
                          fetchEnterpriseBySlug           │
                                │                         │
                ┌───────────────┼─────────────┐           │
                ▼               ▼             ▼           │
       admin/operator      no qualifying     no UUID      │
       role for slug       role for slug     returned     │
                │               │             │           │
                ▼               └──────┬──────┴───────────┘
        /<slug>/admin/                 │
        register/activate              ▼
        (UserActivationPage)   ┌──────────────────────┐
                               │ unauthorized branch  │
                               │ checks bounce gate   │
                               └──────────────────────┘
                                  │              │
                                  ▼              ▼
                          ?pending-invited-   else
                          admin=true AND      │
                          no session flag     ▼
                                  │           terminal alert:
                                  ▼           - no role → warning
                          set session flag;   - no UUID/error → danger
                          window.location =   (danger alert includes a
                            getLogoutRedirect-  logout-then-proxy
                            Url(getProxyLogin-  "sign in again" link)
                            Url(slug))
                          → logout → proxy
                            login → fresh
                            Django login() →
                            User.post_save →
                            admin role granted
                          → returns here, role
                            check now passes →
                            navigate to /activate

----

                  ┌──────────────────────────────────────┐
                  │ /<slug>/admin/register/activate       │
                  │ (UserActivationPage)                  │
                  └──────────────────────────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
   not authed             isActive &&             pending hydration
        │                 roles.length            (5s polling)
        ▼                       │                        │
  proxy login                   ▼                        ▼
  (LoginRedirect)        /<slug>/admin/learners    warning alert
                         + success Toast           (re-renders to
                                                   redirect once
                                                   hydration completes)
```

## Why two pages instead of one

The role refresh (`AdminRegisterPage`) and the email-verification wait
(`UserActivationPage`) have different lifetimes. Role refresh is a one-shot
sequential init; email verification can take minutes while the user clicks the
link in their inbox. Keeping them separate lets each page have its own loading
strategy (init vs. poll) without a single component juggling both.

## Common pitfalls

- **Reading `getAuthenticatedUser()` synchronously after `loginRefresh()` only.**
  `loginRefresh` updates the JWT cookie but not the in-memory auth cache. You
  must `await hydrateAuthenticatedUser()` (or reload the page) before the next
  `getAuthenticatedUser()` call sees the new roles.
- **Redirecting unauthorized users to proxy login.** If the user genuinely
  lacks the role, the proxy can't grant it; redirecting back to the gating
  page produces a loop. Prefer a terminal message.
- **Operator role scoping.** `enterprise_openedx_operator:*` does not match a
  specific UUID via `isEnterpriseUser(user, role, uuid)`. Pass `undefined` for
  the UUID when checking the operator role.
- **Pending invited admin loops.** If you ever re-introduce a proxy-login
  bounce on `/admin/register`, gate it behind the `?pending-invited-admin=true`
  query param *and* a per-tab session flag. Without both, a user who genuinely
  lacks the role (or whose post-bounce JWT still lacks it) will loop.
