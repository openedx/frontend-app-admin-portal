import React from 'react';
import PropTypes from 'prop-types';

import { EnterpriseSubsidiesContext, useEnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { SubsidyRequestsContext, useSubsidyRequestsContext } from '../subsidy-requests/SubsidyRequestsContext';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';

function EnterpriseAppContextProvider({
  enterpriseId,
  enablePortalLearnerCreditManagementScreen,
  children,
}) {
  const enterpriseSubsidiesContext = useEnterpriseSubsidiesContext({
    enterpriseId,
    enablePortalLearnerCreditManagementScreen,
  });

  const {
    enterpriseSubsidyTypes,
  } = enterpriseSubsidiesContext;
  const subsidyRequestsContext = useSubsidyRequestsContext({ enterpriseId, enterpriseSubsidyTypes });

  const isLoading = subsidyRequestsContext.isLoading || enterpriseSubsidiesContext.isLoading;

  if (isLoading) {
    return <EnterpriseAppSkeleton />;
  }

  return (
    <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContext}>
      <SubsidyRequestsContext.Provider value={subsidyRequestsContext}>
        {children}
      </SubsidyRequestsContext.Provider>
    </EnterpriseSubsidiesContext.Provider>
  );
}

EnterpriseAppContextProvider.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default EnterpriseAppContextProvider;
