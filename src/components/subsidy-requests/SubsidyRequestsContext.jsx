import { createContext, useMemo } from 'react';
import {
  useSubsidyRequestConfiguration,
  useSubsidyRequestsOverview,
} from './data/hooks';

export const SubsidyRequestsContext = createContext();

export const useSubsidyRequestsContext = (enterpriseId) => {
  const {
    subsidyRequestConfiguration,
    isLoading: isLoadingSubsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
  } = useSubsidyRequestConfiguration(enterpriseId);

  const {
    isLoading: isLoadingSubsidyRequestOverview,
    subsidyRequestsCounts,
    refreshsubsidyRequestsCounts,
    decrementLicenseRequestCount,
    decrementCouponCodeRequestCount,
  } = useSubsidyRequestsOverview(enterpriseId);

  const context = useMemo(() => ({
    subsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
    subsidyRequestsCounts,
    refreshsubsidyRequestsCounts,
    decrementLicenseRequestCount,
    decrementCouponCodeRequestCount,
    isLoading: isLoadingSubsidyRequestConfiguration || isLoadingSubsidyRequestOverview,
  }), [subsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
    subsidyRequestsCounts,
    refreshsubsidyRequestsCounts,
    decrementLicenseRequestCount,
    decrementCouponCodeRequestCount,
    isLoadingSubsidyRequestConfiguration,
    isLoadingSubsidyRequestOverview,
  ]);

  return context;
};
