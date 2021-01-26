import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  Container, Row, Col, Alert, MailtoLink,
} from '@edx/paragon';
import { getAuthenticatedUser, hydrateAuthenticatedUser } from '@edx/frontend-platform/auth';

import LoadingMessage from '../LoadingMessage';
import { ToastsContext } from '../Toasts';

import { redirectToProxyLogin } from '../../utils';

const USER_ACCOUNT_POLLING_TIMEOUT = 5000;

const UserActivationPage = ({
  match,
}) => {
  const user = getAuthenticatedUser();
  const {
    username, roles, email, isActive,
  } = user;
  console.log('USER UAP', user);
  const [isPollingUserAccount, setIsPollingUserAccount] = useState(false);
  const enterpriseSlug = useMemo(
    () => match.params.enterpriseSlug,
    [match.params],
  );
  const { addToast } = useContext(ToastsContext);

//   useEffect(
//     () => {
//       let timeout;
//       if (username && !isActive) {
//         // user is authenticated and we finished hydrating the full user metadata, but
//         // the user has not verified their email address. we start polling for their user
//         // metadata every USER_ACCOUNT_POLLING_TIMEOUT milliseconds.
//         setIsPollingUserAccount(true);

//         timeout = setTimeout(() => {
//           hydrateAuthenticatedUser();
//         }, USER_ACCOUNT_POLLING_TIMEOUT);
//       }
//       return () => {
//         if (timeout) {
//           clearInterval(timeout);
//         }
//       };
//     },
//     // stringifying the data allows us to get a quick deep equality
//     [JSON.stringify(user)],
//   );

  if (username) {
    // user is authenticated, but doesn't have any JWT roles so redirect the user to
    // `:enterpriseSlug/admin/register` to display the proper error message.
    // if (!roles?.length) {
    //   return (
    //     <Redirect to={`/${enterpriseSlug}/admin/register`} />
    //   );
    // }

    // user data is hydrated with a verified email address, so redirect the user
    // to the default page in the Admin Portal.
    if (isActive !== undefined && isActive) {
      addToast('Your edX administrator account was successfully activated.');
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
    const isUserLoadedAndInactive = !!(isActive !== undefined && !isActive);
    if (isUserLoadedAndInactive || isPollingUserAccount) {
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default UserActivationPage;
