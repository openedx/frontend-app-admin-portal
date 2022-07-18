import { createContext, useMemo } from 'react';
import { SUPPORTED_SUBSIDY_TYPES } from '../../data/constants/subsidyRequests';
import {
  useSubsidyRequestConfiguration,
  useSubsidyRequestsOverview,
} from './data/hooks';

export const SubsidyRequestsContext = createContext();

export const useSubsidyRequestsContext = ({
  enterpriseId,
  enterpriseSubsidyTypes,
}) => {
  const enterpriseSubsidyTypesForRequests = useMemo(() => {
    const supportedSubsidyTypesForRequests = Object.values(SUPPORTED_SUBSIDY_TYPES);
    return enterpriseSubsidyTypes.filter(
      type => supportedSubsidyTypesForRequests.includes(type),
    );
  }, [enterpriseSubsidyTypes]);

  const {
    subsidyRequestConfiguration,
    isLoading: isLoadingSubsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
  } = useSubsidyRequestConfiguration({
    enterpriseId,
    enterpriseSubsidyTypesForRequests,
  });

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
    enterpriseSubsidyTypesForRequests,
    isLoading: isLoadingSubsidyRequestConfiguration || isLoadingSubsidyRequestOverview,
  }), [
    subsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
    subsidyRequestsCounts,
    refreshsubsidyRequestsCounts,
    decrementLicenseRequestCount,
    decrementCouponCodeRequestCount,
    enterpriseSubsidyTypesForRequests,
    isLoadingSubsidyRequestConfiguration,
    isLoadingSubsidyRequestOverview]);

  return context;
};
