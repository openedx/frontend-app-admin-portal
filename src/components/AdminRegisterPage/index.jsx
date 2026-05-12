import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Container, Row, Col, Alert, MailtoLink, Hyperlink,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import {
  getAuthenticatedUser, getLogoutRedirectUrl, hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { LoginRedirect, getProxyLoginUrl } from '@2uinc/frontend-enterprise-logistration';
import {
  isEnterpriseUser, ENTERPRISE_ADMIN, ENTERPRISE_OPENEDX_OPERATOR,
} from '@2uinc/frontend-enterprise-utils';

import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import LmsApiService from '../../data/services/LmsApiService';
import { configuration } from '../../config';

const STATUS = {
  PENDING: 'pending',
  REDIRECTING: 'redirecting',
  NO_ADMIN_ACCESS: 'no-admin-access',
  ERROR: 'error',
};

// Query param included in pending-admin onboarding email links. When present
// on /admin/register and the authenticated user lacks the role (e.g. a new
// pending admin whose edx-platform user record hasn't been saved yet),
// we first redirect through logout and then to the enterprise proxy login URL.
// That logout-then-force-login flow triggers the user save in edx-platform,
// which promotes the pending invite to a full admin role on the
// customer.
const PENDING_INVITED_ADMIN_PARAM = 'pending-invited-admin';
const proxyLoginAttemptedSessionKey = (slug) => `admin_register_proxy_login_attempted_${slug}`;

// Entry point of the admin registration+activation flow. Refreshes the JWT,
// hydrates the auth cache, and gates entry to UserActivationPage based on
// whether the user has an enterprise_admin role for this enterprise or an
// enterprise_openedx_operator role (wildcard).
// See docs/references/admin-registration-and-activation.md.
const AdminRegisterPage = () => {
  // Pin the authed-user reference for the lifetime of this mount so the
  // init() effect can't accidentally re-run if frontend-platform ever returns
  // a new object reference from getAuthenticatedUser() between renders. We
  // only care whether a user is authed at mount; the hydrated user is read
  // freshly inside init() after hydrateAuthenticatedUser() resolves.
  const user = useMemo(() => getAuthenticatedUser(), []);
  const { enterpriseSlug } = useParams();
  const [searchParams] = useSearchParams();
  const isPendingInvitedAdmin = searchParams.get(PENDING_INVITED_ADMIN_PARAM) === 'true';
  const [status, setStatus] = useState(STATUS.PENDING);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    // Reset status when enterpriseSlug changes so the previous enterprise's
    // terminal state (alert/redirect) doesn't remain visible while init() reruns.
    setStatus(STATUS.PENDING);
    let cancelled = false;

    // Pending invited admin: one-shot logout-then-proxy-login bounce to force
    // a fresh Django login() on edx-platform, which updates last_login on the
    // User model. The User post_save signal handler then runs
    // activate_admin_permissions, which promotes the matching
    // PendingEnterpriseCustomerAdminUser to a real EnterpriseCustomerAdmin and
    // grants the enterprise_admin role. A plain proxy-login redirect is not
    // sufficient: if the LMS session is still valid, no login() fires and no
    // promotion happens. See ADR 0013.
    //
    // Applies whenever we can't grant access from the current JWT — including
    // when the enterprise lookup returns no UUID or fails outright, because
    // the LMS may refuse the lookup until the user record is linked to the
    // customer. The sessionStorage flag prevents looping if the round-trip
    // doesn't actually grant the role.
    const tryPendingInvitedAdminBounce = () => {
      const proxyAttemptKey = proxyLoginAttemptedSessionKey(enterpriseSlug);
      if (isPendingInvitedAdmin && !sessionStorage.getItem(proxyAttemptKey)) {
        sessionStorage.setItem(proxyAttemptKey, 'true');
        global.location.href = getLogoutRedirectUrl(getProxyLoginUrl(enterpriseSlug));
        return true;
      }
      return false;
    };

    const init = async () => {
      try {
        // Known tradeoff: loginRefresh + hydrate run on every mount, including
        // for returning admins whose JWT is already correct. The extra two
        // network calls are an acceptable cost for guaranteeing fresh roles
        // before the access check; these pages are entered rarely.
        await LmsApiService.loginRefresh();
        await hydrateAuthenticatedUser();
        const response = await LmsApiService.fetchEnterpriseBySlug(enterpriseSlug);
        const enterpriseUUID = response?.data?.uuid;
        if (cancelled) { return; }
        if (!enterpriseUUID) {
          if (tryPendingInvitedAdminBounce()) { return; }
          setStatus(STATUS.ERROR);
          return;
        }
        const hydratedUser = getAuthenticatedUser();
        // Operators have wildcard roles (e.g. `enterprise_openedx_operator:*`) that aren't
        // scoped to a specific enterprise UUID, so check that role without the UUID filter.
        const hasAccess = (
          isEnterpriseUser(hydratedUser, ENTERPRISE_ADMIN, enterpriseUUID)
          || isEnterpriseUser(hydratedUser, ENTERPRISE_OPENEDX_OPERATOR)
        );
        if (hasAccess) {
          setStatus(STATUS.REDIRECTING);
          return;
        }
        if (tryPendingInvitedAdminBounce()) { return; }
        setStatus(STATUS.NO_ADMIN_ACCESS);
      } catch (error) {
        logError(error);
        if (cancelled) { return; }
        if (tryPendingInvitedAdminBounce()) { return; }
        setStatus(STATUS.ERROR);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [user, enterpriseSlug, isPendingInvitedAdmin]);

  if (!user) {
    return (
      <LoginRedirect
        loadingDisplay={<EnterpriseAppSkeleton />}
      />
    );
  }

  if (status === STATUS.REDIRECTING) {
    return <Navigate to={`/${enterpriseSlug}/admin/register/activate`} replace />;
  }

  if (status === STATUS.NO_ADMIN_ACCESS) {
    return (
      <Container style={{ flex: 1 }} fluid>
        <Row className="my-3 justify-content-md-center">
          <Col xs lg={8} offset={1}>
            <Alert variant="warning">
              <p>
                <FormattedMessage
                  defaultMessage="This account does not have administrator access to {enterpriseSlug} on {platform_name}. If you believe this is an error, please contact your organization's administrator."
                  id="adminPortal.register.noAdminAccess"
                  values={{
                    enterpriseSlug,
                    platform_name: configuration.PLATFORM_NAME,
                  }}
                />
              </p>
              <p className="mb-0">
                <FormattedMessage
                  defaultMessage="If you run into further issues, please contact the {support_name} at {support_link}."
                  id="adminPortal.register.support"
                  values={{
                    support_name: configuration.CUSTOMER_SUPPORT_NAME,
                    support_link: <MailtoLink className="alert-link" to={configuration.CUSTOMER_SUPPORT_EMAIL}>{configuration.CUSTOMER_SUPPORT_EMAIL}</MailtoLink>,
                  }}
                />
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (status === STATUS.ERROR) {
    return (
      <Container style={{ flex: 1 }} fluid>
        <Row className="my-3 justify-content-md-center">
          <Col xs lg={8} offset={1}>
            <Alert variant="danger">
              <p>
                <FormattedMessage
                  defaultMessage="Something went wrong loading the registration page. Try {sign_in_again_link}, or contact {support_link} if the problem persists."
                  id="adminPortal.register.error"
                  values={{
                    sign_in_again_link: (
                      <Hyperlink className="alert-link" destination={getLogoutRedirectUrl(getProxyLoginUrl(enterpriseSlug))}>
                        <FormattedMessage
                          defaultMessage="signing in again"
                          id="adminPortal.register.error.signInAgain"
                        />
                      </Hyperlink>
                    ),
                    support_link: <MailtoLink className="alert-link" to={configuration.CUSTOMER_SUPPORT_EMAIL}>{configuration.CUSTOMER_SUPPORT_EMAIL}</MailtoLink>,
                  }}
                />
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return <EnterpriseAppSkeleton />;
};

export default AdminRegisterPage;
