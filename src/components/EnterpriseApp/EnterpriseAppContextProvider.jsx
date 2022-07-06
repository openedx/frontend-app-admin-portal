import React from 'react';
import PropTypes from 'prop-types';

import { EnterpriseSubsidiesContext, useEnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { SubsidyRequestsContext, useSubsidyRequestsContext } from '../subsidy-requests/SubsidyRequestsContext';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';

const EnterpriseAppContextProvider = ({
  enterpriseId,
  enablePortalLearnerCreditManagementScreen,
  children,
}) => {
  const subsidyRequestsContext = useSubsidyRequestsContext(enterpriseId);
  const enterpriseSubsidiesContext = useEnterpriseSubsidiesContext({
    enablePortalLearnerCreditManagementScreen,
  });

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
};

EnterpriseAppContextProvider.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default EnterpriseAppContextProvider;
