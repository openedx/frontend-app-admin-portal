import React from 'react';
import { LoginRedirect } from '@edx/frontend-enterprise-logistration';

import EnterpriseApp from '../../containers/EnterpriseApp';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';

const AuthenticatedEnterpriseApp = () => (
  <LoginRedirect
    loadingDisplay={<EnterpriseAppSkeleton />}
  >
    <EnterpriseApp />
  </LoginRedirect>
);

export default AuthenticatedEnterpriseApp;
