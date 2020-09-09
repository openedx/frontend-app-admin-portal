import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, Alert, MailtoLink } from '@edx/paragon';

import LoadingMessage from '../LoadingMessage';

import { redirectToProxyLogin } from '../../utils';

const USER_ACCOUNT_POLLING_TIMEOUT = 5000;

const UserActivationPage = ({
  match,
  authentication,
  userAccount,
  fetchUserAccount,
}) => {
  const [isPollingUserAccount, setIsPollingUserAccount] = useState(false);
  const enterpriseSlug = useMemo(
    () => match.params.enterpriseSlug,
    [match.params],
  );

  useEffect(
    () => {
      let timeout;
      if (authentication?.username && userAccount?.loaded && !userAccount?.isActive) {
        // user is authenticated and we finished hydrating the full user metadata, but
        // the user has not verified their email address. we start polling for their user
        // metadata every USER_ACCOUNT_POLLING_TIMEOUT milliseconds.
        setIsPollingUserAccount(true);
        timeout = setTimeout(() => {
          fetchUserAccount(authentication.username);
        }, USER_ACCOUNT_POLLING_TIMEOUT);
      }
      return () => {
        if (timeout) {
          clearInterval(timeout);
        }
      };
    },
    [authentication, userAccount],
  );

  if (authentication?.username) {
    // user is authenticated, but doesn't any JWT roles so redirect the user to
    // `:enterpriseSlug/admin/register` to display the proper error message.
    if (!authentication.roles?.length) {
      return (
        <Redirect to={`/${enterpriseSlug}/admin/register`} />
      );
    }

    // user data is hydrated with a verified email address, so redirect the user
    // to the default page in the Admin Portal.
    if (userAccount?.loaded && userAccount?.isActive) {
      return (
        <Redirect
          to={{
            pathname: `/${enterpriseSlug}/admin/learners`,
            state: { adminRegistrationSuccess: true },
          }}
        />
      );
    }

    // user data is hydrated with a unverified email address, so display a warning message
    const isUserLoadedAndNotActive = !!(userAccount?.loaded && !userAccount?.isActive);
    if (isUserLoadedAndNotActive || isPollingUserAccount) {
      // user is authenticated but has not yet verified their email via the "Activate
      // your account" flow, so we should prevent access to the Admin Portal.
      return (
        <Container fluid>
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
    }

    return (
      <Container fluid>
        <Row className="my-3">
          <Col>
            <LoadingMessage className="user-activation" />
          </Col>
        </Row>
      </Container>
    );
  }

  if (!isPollingUserAccount) {
    redirectToProxyLogin(enterpriseSlug);
  }

  return (
    <Container fluid>
      <Row className="my-3">
        <Col>
          <LoadingMessage className="user-activation" />
        </Col>
      </Row>
    </Container>
  );
};

UserActivationPage.propTypes = {
  authentication: PropTypes.shape().isRequired,
  userAccount: PropTypes.shape().isRequired,
  fetchUserAccount: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default UserActivationPage;
