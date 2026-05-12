==================================================================
13. Force a full logout before proxy-login for pending invited admins
==================================================================

******
Status
******

Accepted (May 2026)

*******
Context
*******

A newly invited enterprise admin clicking the link in their onboarding email
arrives at ``/<slug>/admin/register`` already authenticated (their LMS
session is still valid from prior activity), but with no
``enterprise_admin`` role for the customer. The role is granted server-side
by ``enterprise/api/__init__.py::activate_admin_permissions`` in edx-enterprise,
which runs from the User model's ``post_save`` signal handler
(``enterprise/signals.py::handle_user_post_save``). That handler iterates the
user's ``EnterpriseCustomerUser`` records and promotes any matching
``PendingEnterpriseCustomerAdminUser`` to an ``EnterpriseCustomerAdmin``
(creating the role assignment and deleting the pending record).

The signal only fires when something writes the User model. Django's
``login()`` writes ``last_login``, which fires ``post_save``. So the
promotion is triggered by a fresh login — not by an arbitrary HTTP request
and not by an idempotent JWT refresh.

This frontend page can't perform the User save itself; it has to send the
user somewhere that does. The natural candidate was
``getProxyLoginUrl(slug)`` from ``@2uinc/frontend-enterprise-logistration``,
which maps to ``EnterpriseProxyLoginView`` in edx-enterprise. That view
just redirects to either the TPA login URL or
``/register?proxy_login=true&enterprise_customer=<uuid>&next=<...>``. If
the user is already authenticated, ``/register`` recognizes the existing
session and forwards to ``next`` without re-running ``login()``. No
``last_login`` write, no signal, no promotion.

Manual testing confirmed the failure: hitting
``getProxyLoginUrl(slug)`` while authenticated returned the user to
``/admin/register`` with the same empty roles, hit our terminal
``NO_ADMIN_ACCESS`` alert, and never promoted the pending invite.

********
Decision
********

For the pending-invited-admin bounce, swap the redirect target from
``getProxyLoginUrl(slug)`` to a logout URL whose ``next`` value is the
same admin/register URL with any required query params preserved. The
helper ``getEnterpriseAdminRegisterLogoutUrl(slug, params)`` in
``src/utils.js`` builds it via the WHATWG ``URL`` API: it constructs
``<BASE_URL>/<slug>/admin/register`` (with each param applied via
``URL.searchParams.set``), then attaches that to ``LOGOUT_URL`` as the
``next`` query param. Using the ``URL`` API ensures every reserved
character (``?``, ``&``, ``#``, ``=``, ``/``, ``:``) is encoded once
and the result decodes back to the intended URL server-side. Logging out clears the session cookie,
so the subsequent navigation re-renders ``AdminRegisterPage`` while
unauthenticated, ``LoginRedirect`` kicks in, ``login()`` runs,
``last_login`` updates, the signal fires, and the
``activate_admin_permissions`` path runs.

An earlier implementation used
``getLogoutRedirectUrl(getProxyLoginUrl(slug))`` from
``@edx/frontend-platform/auth`` and
``@2uinc/frontend-enterprise-logistration`` respectively. That wrapper
fully URL-encodes its argument, producing a nested-encoded ``next``
value (the proxy login URL's own query string got double-encoded). The
LMS logout view forwarded the encoded blob to ``LOGOUT_REDIRECT_URL``
unchanged, and the destination then 404'd because the doubly-encoded
``?`` no longer separated the path from the query string. The
hand-built single-encoding pattern (also used by the learner portal's
``AvatarDropdown``) avoids the nested encoding.

The same helper is used as the ``destination`` for the "signing in
again" remediation link in the ``STATUS.ERROR`` alert on
``AdminRegisterPage``, and as the ``href`` of the Logout dropdown item
in the global ``Header`` (replacing its prior
``getLogoutRedirectUrl(getProxyLoginUrl(slug))`` chain).

A per-tab, per-enterprise ``sessionStorage`` flag
(``admin_register_proxy_login_attempted_<slug>``) gates the bounce to
one attempt per session, so a user whose post-bounce JWT still lacks
the role falls through to the terminal warning alert instead of
looping.

The bounce is also a no-op without the ``?pending-invited-admin=true``
query param. Onboarding email templates own setting this param;
arbitrary visitors to ``/admin/register`` without an active invite see
the terminal warning instead.

************
Consequences
************

Positive:

- Pending invited admins arriving from email links get promoted on the
  first round-trip, without any backend changes.
- No new endpoints to maintain. The fix is a one-line target swap that
  composes two existing platform utilities.
- The ``Header/index.jsx`` logout flow already uses the same
  ``getLogoutRedirectUrl(getProxyLoginUrl(slug))`` pattern, so the
  approach is precedented in this codebase.

Negative / tradeoffs:

- The bounce always logs the user out. For an already-authenticated user
  who is also a *different* enterprise's admin, the logout invalidates
  any concurrent sessions/tabs they had. Acceptable because the
  pending-invited-admin path is opt-in via the query param and only
  ships in onboarding email links.
- This couples the frontend behavior to the edx-enterprise signal
  handler's reliance on ``last_login`` writes. If the upstream
  promotion mechanism changes (e.g., moves to a dedicated endpoint),
  this code should switch to calling that endpoint directly instead
  of relying on a side-effect of ``login()``.
- A future caller who wants the proxy-login behavior *without* a logout
  (e.g., for a user we know is unauthenticated) needs to call
  ``getProxyLoginUrl`` directly. The two helpers compose; neither
  replaces the other.

*************
Alternatives Considered
*************

1. **Use ``getProxyLoginUrl(slug, inviteKey)`` with an
   ``EnterpriseCustomerInviteKey``.** The proxy-login view accepts an
   invite-key param and resolves the EnterpriseCustomer from it, but
   it still doesn't force a fresh ``login()``; the invite-key path
   targets learner linking, not admin promotion.

2. **Add a dedicated edx-enterprise endpoint that explicitly runs
   ``activate_admin_permissions`` from an authenticated GET/POST.**
   Cleaner long-term, but requires a backend change for a problem
   that already has a frontend-only solution via composition.

3. **Poll for the role on this page (the way ``UserActivationPage``
   polls for ``isActive``).** Doesn't help: nothing on the server is
   going to change the role until the User is saved, so polling would
   spin forever.

*****************
Related Documents
*****************

- ``docs/references/admin-registration-and-activation.md`` — overall
  flow and component contracts.
- ``edx-enterprise``: ``enterprise/signals.py::handle_user_post_save``,
  ``enterprise/api/__init__.py::activate_admin_permissions``,
  ``enterprise/views.py::EnterpriseProxyLoginView``.
