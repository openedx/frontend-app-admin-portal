import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  Container, Row, Col, Alert, MailtoLink, Toast,
} from '@edx/paragon';
import { getAuthenticatedUser, hydrateAuthenticatedUser } from '@edx/frontend-platform/auth';
import { LoginRedirect } from '@edx/frontend-enterprise-logistration';

import { useInterval } from '../../hooks';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';

const USER_ACCOUNT_POLLING_TIMEOUT = 5000;

const UserActivationPage = ({ match }) => {
  const user = getAuthenticatedUser();
  const [showToast, setShowToast] = useState(false);

  const { enterpriseSlug } = match.params;
  const { roles, isActive } = user || {};

  useInterval(() => {
    if (user && !user.isActive) {
      hydrateAuthenticatedUser();
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

  if (!roles?.length) {
    // user is authenticated but doesn't have any JWT roles so redirect the user to
    // `:enterpriseSlug/admin/register` to force a log out in an attempt to refresh JWT roles.
    return (
      <Redirect to={`/${enterpriseSlug}/admin/register`} />
    );
  }

  if (isActive === undefined) {
    // user hydration is still pending when ``isActive`` is undefined, so display app skeleton state
    return <EnterpriseAppSkeleton />;
  }

  // user data is hydrated with a verified email address, so redirect the user
  // to the default page in the Admin Portal.
  if (isActive) {
    return (
      <>
        <Redirect to={`/${enterpriseSlug}/admin/learners`} />
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
        >
          Your edX administrator account was successfully activated.
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
              In order to continue, you must verify your email address to activate
              your edX account. Please stay on this page as it will automatically refresh
              once your account is activated.
            </p>
            <p className="mb-0">
              If you run into further issues, please contact the edX Customer
              Success team at{' '}
              <MailtoLink className="alert-link" to="customersuccess@edx.org">
                customersuccess@edx.org
              </MailtoLink>.
            </p>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

UserActivationPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default UserActivationPage;
