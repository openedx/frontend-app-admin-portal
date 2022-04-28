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

const SubsidyRequestsContextProviderWrapper = ({ enableBrowseAndRequest, enterpriseUUID, children }) => {
  const noop = () => {};
  const contextValueForDisabledBrowseAndRequest = useMemo(() => ({
    subsidyRequestConfiguration: {
      enterpriseCustomerUuid: enterpriseUUID,
      subsidyRequestsEnabled: false,
      subsidyType: null,
    },
    updateSubsidyRequestConfiguration: noop,
    subsidyRequestsCounts: {},
    refreshsubsidyRequestsCounts: noop,
    decrementLicenseRequestCount: noop,
    decrementCouponCodeRequestCount: noop,
  }), [enterpriseUUID]);

  if (enableBrowseAndRequest) {
    return (
      <SubsidyRequestsContextProvider enterpriseUUID={enterpriseUUID}>
        {children}
      </SubsidyRequestsContextProvider>
    );
  }

  return (
    <SubsidyRequestsContext.Provider value={contextValueForDisabledBrowseAndRequest}>
      {children}
    </SubsidyRequestsContext.Provider>
  );
};

SubsidyRequestsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseUUID: PropTypes.string,
};

SubsidyRequestsContextProviderWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  enableBrowseAndRequest: PropTypes.bool,
  enterpriseUUID: PropTypes.string,
};

SubsidyRequestsContextProvider.defaultProps = {
  enterpriseUUID: undefined,
};

SubsidyRequestsContextProviderWrapper.defaultProps = {
  enableBrowseAndRequest: false,
  enterpriseUUID: undefined,
};

export default SubsidyRequestsContextProviderWrapper;
