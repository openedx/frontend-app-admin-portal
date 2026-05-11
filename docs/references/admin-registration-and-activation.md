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

| State                      | Render                                                  |
| -------------------------- | ------------------------------------------------------- |
| Unauthenticated            | `LoginRedirect` → enterprise proxy login                |
| Pending (`init()` running) | `EnterpriseAppSkeleton`                                 |
| Has admin or operator role | `<Navigate replace>` to `/<slug>/admin/register/activate` |
| No qualifying role         | Terminal warning alert (no redirect, no proxy bounce)   |
| Network/lookup failure     | Terminal error alert                                    |

The terminal alerts are important: earlier versions of this page bounced
non-admin authenticated users back to `getProxyLoginUrl(slug)`. When the proxy
round-trip didn't grant the role (e.g. the user genuinely isn't an admin), the
user looped indefinitely between this page and the proxy.

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
              ┌─────────────┼─────────────────────────────┐
              │             │                             │
              ▼             ▼                             ▼
       not authed      authed, init() runs            init() errors
              │             │                             │
              ▼             ▼                             ▼
       proxy login    role check after hydrate      error alert
                            │
                ┌───────────┼──────────────┐
                ▼                          ▼
       admin/operator               no qualifying role
                │                          │
                ▼                          ▼
      /<slug>/admin/register/activate     warning alert
      (UserActivationPage)                (terminal)
                │
        ┌───────┼────────────────┐
        ▼       ▼                ▼
   not authed   isActive &&      pending hydration
        │       roles.length     (5s polling)
        ▼       │                │
  proxy login   ▼                ▼
                /<slug>/         warning alert
                admin/learners   (re-renders to
                + Toast          redirect once
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
