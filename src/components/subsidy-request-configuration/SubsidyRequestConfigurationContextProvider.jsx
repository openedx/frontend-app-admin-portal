import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSubsidyRequestConfiguration } from './data/hooks';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';

export const SubsidyRequestConfigurationContext = createContext();

const SubsidyRequestConfigurationContextProvider = ({ enterpriseUUID, children }) => {
  const {
    subsidyRequestConfiguration,
    isLoading,
    updateSubsidyRequestConfiguration,
  } = useSubsidyRequestConfiguration(enterpriseUUID);

  const context = useMemo(() => ({
    subsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
  }), [subsidyRequestConfiguration]);

  if (isLoading) {
    return <EnterpriseAppSkeleton />;
  }

  return (
    <SubsidyRequestConfigurationContext.Provider value={context}>
      {children}
    </SubsidyRequestConfigurationContext.Provider>
  );
};

const SubsidyRequestConfigurationContextProviderWrapper = ({ enableBrowseAndRequest, enterpriseUUID, children }) => {
  if (enableBrowseAndRequest) {
    return (
      <SubsidyRequestConfigurationContextProvider enterpriseUUID={enterpriseUUID}>
        {children}
      </SubsidyRequestConfigurationContextProvider>
    );
  }

  const context = useMemo(() => ({
    subsidyRequestConfiguration: {
      enterpriseCustomerUuid: enterpriseUUID,
      subsidyRequestsEnabled: false,
      subsidyType: null,
    },
    isLoading: false,
  }), []);

  return (
    <SubsidyRequestConfigurationContext.Provider value={context}>
      {children}
    </SubsidyRequestConfigurationContext.Provider>
  );
};

SubsidyRequestConfigurationContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseUUID: PropTypes.string,
};

SubsidyRequestConfigurationContextProviderWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  enableBrowseAndRequest: PropTypes.bool,
  enterpriseUUID: PropTypes.string,
};

SubsidyRequestConfigurationContextProvider.defaultProps = {
  enterpriseUUID: undefined,
};

SubsidyRequestConfigurationContextProviderWrapper.defaultProps = {
  enableBrowseAndRequest: false,
  enterpriseUUID: undefined,
};

export default SubsidyRequestConfigurationContextProviderWrapper;
