import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect, useHistory, withRouter } from 'react-router-dom';
import { Container, Row, Col } from '@edx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import LoadingMessage from '../LoadingMessage';

import {
  getProxyLoginUrl,
  redirectToProxyLogin,
  hasEnterpriseAdminRole,
} from '../../utils';

const AdminRegisterPage = ({ match }) => {
  const { enterpriseSlug } = match.params;
  const authentication = getAuthenticatedUser();
  const history = useHistory();

  useEffect(
    () => {
      if (!authentication.username) {
        // user is not authenticated
        return;
      }

      if (!hasEnterpriseAdminRole(authentication.roles)) {
        // user is authenticated but doesn't have the `enterprise_admin` JWT role; force a log out so their
        // JWT roles gets refreshed. on their next login, the JWT roles will be updated.
        const logoutRedirectUrl = getProxyLoginUrl(enterpriseSlug);
        history.push(logoutRedirectUrl);
      }
    },
    [authentication.username, authentication.roles],
  );

  if (authentication.username) {
    if (!hasEnterpriseAdminRole(authentication.roles)) {
      // user is authenticated but doesn't have the `enterprise_admin` JWT role, so display a message while
      // redirecting the user to the log out page.
      return (
        <Container fluid>
          <Row className="admin-registration-logout py-3">
            <Col>Logging out...</Col>
          </Row>
        </Container>
      );
    }

    // user is authenticated and has the `enterprise_admin` JWT role, so redirect user to
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default withRouter(AdminRegisterPage);
