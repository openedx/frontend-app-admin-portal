import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Navigate, useParams } from 'react-router-dom';
import {
  Container, Row, Col, Alert, MailtoLink,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedUser, hydrateAuthenticatedUser } from '@edx/frontend-platform/auth';
import { LoginRedirect } from '@2uinc/frontend-enterprise-logistration';
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
  const [status, setStatus] = useState(STATUS.PENDING);

  useEffect(() => {
    if (!user) {
      return undefined;
    }
    // Reset status when enterpriseSlug changes so the previous enterprise's
    // terminal state (alert/redirect) doesn't remain visible while init() reruns.
    setStatus(STATUS.PENDING);
    let cancelled = false;
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
        setStatus(hasAccess ? STATUS.REDIRECTING : STATUS.NO_ADMIN_ACCESS);
      } catch (error) {
        logError(error);
        if (!cancelled) {
          setStatus(STATUS.ERROR);
        }
      }
    };
    init();
    return () => { cancelled = true; };
  }, [user, enterpriseSlug]);

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
              <FormattedMessage
                defaultMessage="Something went wrong loading the registration page. Please try again, or contact {support_link} if the problem persists."
                id="adminPortal.register.error"
                values={{
                  support_link: <MailtoLink className="alert-link" to={configuration.CUSTOMER_SUPPORT_EMAIL}>{configuration.CUSTOMER_SUPPORT_EMAIL}</MailtoLink>,
                }}
              />
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return <EnterpriseAppSkeleton />;
};

export default AdminRegisterPage;
