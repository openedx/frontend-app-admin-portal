import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { LoginRedirect, getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';
import { isEnterpriseUser, ENTERPRISE_ADMIN } from '@edx/frontend-enterprise-utils';

import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import LmsApiService from '../../data/services/LmsApiService';

const AdminRegisterPage = () => {
  const user = getAuthenticatedUser();
  const { enterpriseSlug } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      return;
    }
    const processEnterpriseAdmin = (enterpriseUUID) => {
      const authenticatedUser = getAuthenticatedUser();
      const isEnterpriseAdmin = isEnterpriseUser(authenticatedUser, ENTERPRISE_ADMIN, enterpriseUUID);
      if (isEnterpriseAdmin) {
        // user is authenticated and has the ``enterprise_admin`` JWT role, so redirect user to
        // account activation page to ensure they verify their email address.
        navigate(`/${enterpriseSlug}/admin/register/activate`);
      } else {
        // user is authenticated but doesn't have the `enterprise_admin` JWT role; redirect to
        // proxy login to refresh JWT cookie and pick up any new role assignments.
        global.location.href = getProxyLoginUrl(enterpriseSlug);
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
    LmsApiService.loginRefresh().then(_ => {
      if (!localStorage.getItem('first_visit_register_page')) {
        localStorage.setItem('first_visit_register_page', 'true');
        window.location.reload();
      }
      return _;
    }).catch(error => logError(error));
    getEnterpriseBySlug().then(data => data).catch(error => logError(error));
  }, [user, navigate, enterpriseSlug]);

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

export default AdminRegisterPage;
