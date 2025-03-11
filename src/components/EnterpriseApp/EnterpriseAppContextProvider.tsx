import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';

import { EnterpriseSubsidiesContext, useEnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { SubsidyRequestsContext, useSubsidyRequestsContext } from '../subsidy-requests/SubsidyRequestsContext';
import {
  useEnterpriseCurationContext,
  useUpdateActiveEnterpriseForUser,
} from './data/hooks';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';

export type THighlightSet = {
  uuid: string;
  isPublished: boolean;
  title: string;
  highlightedContentUuids: string[];
};

export type TEnterpriseCuration = {
  uuid: string;
  title: string;
  isHighlightFeatureActive: boolean;
  canOnlyViewHighlightSets: boolean;
  highlightSets: THighlightSet[];
  created: string;
  modified: string;
  // [tech debt] unclear whether `toastText` *should* be in this type.
  toastText?: string;
};

export type TEnterpriseCurationData = {
  enterpriseCuration: TEnterpriseCuration;
  isLoading: boolean;
  fetchError: Error | null;
};

export type TEnterpriseAppContext = {
  enterpriseCuration: TEnterpriseCurationData;
};

interface EnterpriseAppContextProviderProps {
  enterpriseId: string;
  enterpriseName: string;
  enterpriseFeatures: {
    topDownAssignmentRealTimeLcm?: boolean;
  };
  enablePortalLearnerCreditManagementScreen: boolean;
  children: React.ReactNode;
}

export const EnterpriseAppContext = createContext<TEnterpriseAppContext>({
  enterpriseCuration: {
    enterpriseCuration: {
      uuid: '',
      title: '',
      isHighlightFeatureActive: false,
      canOnlyViewHighlightSets: false,
      highlightSets: [],
      created: '',
      modified: '',
    },
    isLoading: true,
    fetchError: null,
  },
});

const EnterpriseAppContextProvider: React.FC<EnterpriseAppContextProviderProps> = ({
  enterpriseId,
  enterpriseName,
  enterpriseFeatures,
  enablePortalLearnerCreditManagementScreen,
  children,
}) => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  // subsidies for the enterprise customer
  const enterpriseSubsidiesContext = useEnterpriseSubsidiesContext({
    enterpriseId,
    enablePortalLearnerCreditManagementScreen,
    isTopDownAssignmentEnabled: enterpriseFeatures.topDownAssignmentRealTimeLcm,
  });

  // subsidy requests for the enterprise customer
  const {
    enterpriseSubsidyTypes,
  } = enterpriseSubsidiesContext;
  const subsidyRequestsContext = useSubsidyRequestsContext({ enterpriseId, enterpriseSubsidyTypes });

  // content highlights for the enterprise customer
  const enterpriseCurationContext = useEnterpriseCurationContext({
    enterpriseId,
    curationTitleForCreation: enterpriseName,
  });

  const { isLoading: isUpdatingActiveEnterprise } = useUpdateActiveEnterpriseForUser({
    enterpriseId,
    user: authenticatedUser,
  });

  const isLoading = (
    subsidyRequestsContext.isLoading
    || enterpriseSubsidiesContext.isLoading
    || enterpriseCurationContext.isLoading
    || isUpdatingActiveEnterprise
  );

  // [tech debt] consolidate the other context values (e.g., useSubsidyRequestsContext)
  // into a singular `EnterpriseAppContext.Provider`.
  const enterpriseAppContext = useMemo(() => ({
    enterpriseCuration: enterpriseCurationContext,
  } as TEnterpriseAppContext), [enterpriseCurationContext]);

  if (isLoading) {
    return <EnterpriseAppSkeleton />;
  }

  return (
    <EnterpriseAppContext.Provider value={enterpriseAppContext}>
      {/* [tech debt] consolidate EnterpriseSubsidiesContext and SubsidyRequestsContext into EnterpriseAppContext */}
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
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool.isRequired,
  }).isRequired,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default EnterpriseAppContextProvider;
