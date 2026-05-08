import React, { useState, useEffect } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Navigate, useParams } from 'react-router-dom';
import {
  Container, Row, Col, Alert, MailtoLink, Toast,
} from '@openedx/paragon';
import { getAuthenticatedUser, hydrateAuthenticatedUser } from '@edx/frontend-platform/auth';
import { LoginRedirect } from '@2uinc/frontend-enterprise-logistration';
import { configuration } from '../../config';

import { useInterval } from '../../hooks';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';

const USER_ACCOUNT_POLLING_TIMEOUT = 5000;

const UserActivationPage = () => {
  const [user, setUser] = useState(() => getAuthenticatedUser());
  const [showToast, setShowToast] = useState(false);

  const { enterpriseSlug } = useParams();
  const { isActive, roles } = user || {};

  const refreshUser = async () => {
    await hydrateAuthenticatedUser();
    setUser(getAuthenticatedUser());
  };

  // Hydrate once on mount to refresh stale cached user data (roles/isActive)
  // for users who land here directly after registration. Without this, an
  // empty `roles` would bounce to /admin/register, which can loop back here
  // when its loginRefresh+reload path doesn't run (e.g. localStorage flag
  // already set).
  useEffect(() => {
    if (user && (!user.isActive || !user.roles?.length)) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(() => {
    if (user && (!user.isActive || !user.roles?.length)) {
      refreshUser();
    }
  }, USER_ACCOUNT_POLLING_TIMEOUT);

  useEffect(() => {
    if (isActive) {
      setShowToast(true);
    }
  }, [isActive]);

  if (!user) {
    // user is not authenticated, so redirect to enterprise proxy login flow
    return (
      <LoginRedirect
        loadingDisplay={<EnterpriseAppSkeleton />}
      />
    );
  }

  // user data is hydrated with a verified email address and an enterprise_admin
  // JWT role, so redirect the user to the default page in the Admin Portal.
  // Without the roles guard, a verified user without admin roles would be sent
  // to /admin/learners, where they have no access.
  if (isActive && roles?.length) {
    return (
      <>
        <Navigate to={`/${enterpriseSlug}/admin/learners`} replace />
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
        >
          <FormattedMessage
            defaultMessage="Your edX administrator account was successfully activated."
            id="adminPortal.account.activation.success"
          />
        </Toast>
      </>
    );
  }
  // user data is hydrated with an unverified email address, so display a warning message since
  // they have not yet verified their email via the "Activate your account" flow, so we should
  // prevent access to the Admin Portal.
  return (
    <Container style={{ flex: 1 }} fluid>
      <Row className="my-3 justify-content-md-center">
        <Col xs lg={8} offset={1}>
          <Alert variant="warning">
            <p>
              <FormattedMessage
                defaultMessage="In order to continue, you must verify your email address to activate your {platform_name} account. Please return once your account is activated."
                id="adminPortal.account.activation.required"
                values={{ platform_name: configuration.PLATFORM_NAME }}
              />
            </p>
            <p className="mb-0">
              <FormattedMessage
                defaultMessage="If you run into further issues, please contact the {support_name} at {support_link}."
                id="adminPortal.account.activation.support"
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
};

export default UserActivationPage;
