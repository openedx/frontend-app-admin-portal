import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory, withRouter } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedUser, getLogoutRedirectUrl } from '@edx/frontend-platform/auth';
import { LoginRedirect, getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';
import { isEnterpriseUser, ENTERPRISE_ADMIN } from '@edx/frontend-enterprise-utils';

import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import LmsApiService from '../../data/services/LmsApiService';

const AdminRegisterPage = ({ match }) => {
  const user = getAuthenticatedUser();
  const { enterpriseSlug } = match.params;
  const history = useHistory();

  useEffect(() => {
    if (!user) {
      return;
    }
    const processEnterpriseAdmin = (enterpriseUUID) => {
      const isEnterpriseAdmin = isEnterpriseUser(user, ENTERPRISE_ADMIN, enterpriseUUID);
      if (isEnterpriseAdmin) {
        // user is authenticated and has the ``enterprise_admin`` JWT role, so redirect user to
        // account activation page to ensure they verify their email address.
        history.push(`/${enterpriseSlug}/admin/register/activate`);
      } else {
        // user is authenticated but doesn't have the `enterprise_admin` JWT role; force a log out so their
        // JWT roles gets refreshed. on their next login, the JWT roles will be updated.
        const logoutRedirectUrl = getLogoutRedirectUrl(getProxyLoginUrl(enterpriseSlug));
        global.location.href = logoutRedirectUrl;
      }
    };

    const getEnterpriseBySlug = async () => {
      try {
        const response = await LmsApiService.fetchEnterpriseBySlug(enterpriseSlug);
        if (response.data && response.data.uuid) {
          processEnterpriseAdmin(response.data.uuid);
        }
      } catch (error) {
        logError(error);
      }
    };
    getEnterpriseBySlug();
  }, [user, history, enterpriseSlug]);

  if (!user) {
    // user is not authenticated, so redirect to enterprise proxy login flow
    return (
      <LoginRedirect
        loadingDisplay={<EnterpriseAppSkeleton />}
      />
    );
  }

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
