import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  useSubsidyRequestConfiguration,
  useSubsidyRequestsOverview,
} from './data/hooks';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';

export const SubsidyRequestsContext = createContext();

const SubsidyRequestsContextProvider = ({ enterpriseUUID, children }) => {
  const {
    subsidyRequestConfiguration,
    isLoading: isLoadingSubsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
  } = useSubsidyRequestConfiguration(enterpriseUUID);
  const {
    isLoading: isLoadingSubsidyRequestOverview,
    subsidyRequestsCounts,
    refreshsubsidyRequestsCounts,
    decrementLicenseRequestCount,
    decrementCouponCodeRequestCount,
  } = useSubsidyRequestsOverview(enterpriseUUID);

  const context = useMemo(() => ({
    subsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
    subsidyRequestsCounts,
    refreshsubsidyRequestsCounts,
    decrementLicenseRequestCount,
    decrementCouponCodeRequestCount,
  }), [
    subsidyRequestConfiguration,
    subsidyRequestsCounts,
    decrementCouponCodeRequestCount,
    decrementLicenseRequestCount,
    refreshsubsidyRequestsCounts,
    updateSubsidyRequestConfiguration,
  ]);

  const isLoading = isLoadingSubsidyRequestConfiguration || isLoadingSubsidyRequestOverview;

  if (isLoading) {
    return <EnterpriseAppSkeleton />;
  }

  return (
    <SubsidyRequestsContext.Provider value={context}>
      {children}
    </SubsidyRequestsContext.Provider>
  );
};

SubsidyRequestsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseUUID: PropTypes.string,
};

SubsidyRequestsContextProvider.defaultProps = {
  enterpriseUUID: undefined,
};

export default SubsidyRequestsContextProvider;
