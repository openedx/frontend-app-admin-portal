import React from 'react';
import PropTypes from 'prop-types';

import { EnterpriseSubsidiesContext, useEnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { SubsidyRequestsContext, useSubsidyRequestsContext } from '../subsidy-requests/SubsidyRequestsContext';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';

const EnterpriseAppContextProvider = ({
  enterpriseId,
  children,
}) => {
  const subsidyRequestsContext = useSubsidyRequestsContext(enterpriseId);
  const enterpriseSubsidiesContext = useEnterpriseSubsidiesContext(enterpriseId);

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
  children: PropTypes.node.isRequired,
};

export default EnterpriseAppContextProvider;
