import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, withRouter } from 'react-router-dom';
import { getAuthenticatedUser, getLogoutRedirectUrl } from '@edx/frontend-platform/auth';
import { LoginRedirect, getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';
import { isEnterpriseUser, ENTERPRISE_ADMIN } from '@edx/frontend-enterprise-utils';

import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';

const AdminRegisterPage = ({ match }) => {
  const user = getAuthenticatedUser();

  if (!user) {
    // user is not authenticated, so redirect to enterprise proxy login flow
    return (
      <LoginRedirect
        loadingDisplay={<EnterpriseAppSkeleton />}
      />
    );
  }

  const { enterpriseSlug } = match.params;
  const isEnterpriseAdmin = isEnterpriseUser(user, ENTERPRISE_ADMIN);
  if (isEnterpriseAdmin) {
    // user is authenticated and has the ``enterprise_admin`` JWT role, so redirect user to
    // account activation page to ensure they verify their email address.
    return <Redirect to={`/${enterpriseSlug}/admin/register/activate`} />;
  }

  // user is authenticated but doesn't have the `enterprise_admin` JWT role; force a log out so their
  // JWT roles gets refreshed. on their next login, the JWT roles will be updated.
  const logoutRedirectUrl = getLogoutRedirectUrl(getProxyLoginUrl(enterpriseSlug));
  global.location.href = logoutRedirectUrl;
  return <EnterpriseAppSkeleton />;
};

AdminRegisterPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default withRouter(AdminRegisterPage);
