import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  Container, Row, Col, Alert, MailtoLink,
} from '@edx/paragon';

import LoadingMessage from '../LoadingMessage';

import { redirectToProxyLogin } from '../../utils';

const AdminRegisterPage = ({ authentication, match }) => {
  const enterpriseSlug = useMemo(
    () => match.params.enterpriseSlug,
    [match.params],
  );

  if (authentication?.username) {
    if (!authentication.roles?.length) {
      // user is authenticated but does not have the roles that should be assigned during the
      // registration flow, likely suggesting the user created an account with a non-matching
      // email address.
      return (
        <Container fluid>
          <Row className="my-3 justify-content-md-center">
            <Col xs lg={8} offset={1}>
              <Alert variant="danger">
                <p className="mb-0">
                  We were unable to activate your edX administrator account. Please verify
                  the email used to register your account. If you run into further issues,
                  please contact the edX Customer Success team at{' '}
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

    // user is authenticated and has at least one JWT role, so redirect user to
    // account activation page to ensure they verify their email address.
    return (
      <Redirect to={`/${enterpriseSlug}/admin/register/activate`} />
    );
  }

  // user is not authenticated, so show a loading screen and redirect to proxy login flow
  redirectToProxyLogin(enterpriseSlug);
  return (
    <Container fluid>
      <Row className="my-3">
        <Col>
          <LoadingMessage className="admin-register" />
        </Col>
      </Row>
    </Container>
  );
};

AdminRegisterPage.propTypes = {
  authentication: PropTypes.shape().isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default AdminRegisterPage;
