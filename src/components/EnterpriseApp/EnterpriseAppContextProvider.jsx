import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { EnterpriseSubsidiesContext, useEnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { SubsidyRequestsContext, useSubsidyRequestsContext } from '../subsidy-requests/SubsidyRequestsContext';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';

import { useEnterpriseCurationContext } from './data/hooks';

export const EnterpriseAppContext = createContext();

const EnterpriseAppContextProvider = ({
  enterpriseId,
  enterpriseName,
  enablePortalLearnerCreditManagementScreen,
  children,
}) => {
  const enterpriseSubsidiesContext = useEnterpriseSubsidiesContext({
    enterpriseId,
    enablePortalLearnerCreditManagementScreen,
  });

  const {
    enterpriseSubsidyTypes,
  } = enterpriseSubsidiesContext;
  const subsidyRequestsContext = useSubsidyRequestsContext({ enterpriseId, enterpriseSubsidyTypes });

  const enterpriseCurationContext = useEnterpriseCurationContext({
    enterpriseId,
    curationTitleForCreation: enterpriseName,
  });

  const isLoading = (
    subsidyRequestsContext.isLoading
    || enterpriseSubsidiesContext.isLoading
    || enterpriseCurationContext.isLoading
  );

  const enterpriseAppContext = useMemo(() => ({
    enterpriseCuration: enterpriseCurationContext,
  }), [enterpriseCurationContext]);

  if (isLoading) {
    return <EnterpriseAppSkeleton />;
  }

  // TODO: explain tech debt refactoring
  return (
    <EnterpriseAppContext.Provider value={enterpriseAppContext}>
      <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContext}>
        <SubsidyRequestsContext.Provider value={subsidyRequestsContext}>
          {children}
        </SubsidyRequestsContext.Provider>
      </EnterpriseSubsidiesContext.Provider>
    </EnterpriseAppContext.Provider>
  );
};

EnterpriseAppContextProvider.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseName: PropTypes.string.isRequired,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default EnterpriseAppContextProvider;
