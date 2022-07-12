import { createContext, useMemo } from 'react';
import { SUBSIDY_TYPES } from '../../data/constants/subsidyTypes';
import { useCoupons, useCustomerAgreement, useEnterpriseOffers } from './data/hooks';

export const EnterpriseSubsidiesContext = createContext();

export const useEnterpriseSubsidiesContext = ({ enablePortalLearnerCreditManagementScreen, enterpriseId }) => {
  const {
    offers,
    canManageLearnerCredit,
    isLoading: isLoadingOffers,
  } = useEnterpriseOffers({ enablePortalLearnerCreditManagementScreen });

  const {
    customerAgreement,
    isLoading: isLoadingCustomerAgreement,
  } = useCustomerAgreement({ enterpriseId });

  const {
    coupons,
    isLoading: isLoadingCoupons,
  } = useCoupons();

  const enterpriseSubsidyTypes = useMemo(() => {
    const subsidyTypes = [];

    if (offers.length > 0) {
      subsidyTypes.push(SUBSIDY_TYPES.offer);
    }

    if (coupons.length > 0) {
      subsidyTypes.push(SUBSIDY_TYPES.coupon);
    }

    if (customerAgreement?.subscriptions.length > 0) {
      subsidyTypes.push(SUBSIDY_TYPES.license);
    }
    return subsidyTypes;
  }, [offers.length, coupons.length, customerAgreement]);

  const isLoading = isLoadingOffers || isLoadingCustomerAgreement || isLoadingCoupons;

  const context = useMemo(() => ({
    offers,
    customerAgreement,
    coupons,
    canManageLearnerCredit,
    enterpriseSubsidyTypes,
    isLoading,
  }), [offers, customerAgreement, coupons, canManageLearnerCredit, enterpriseSubsidyTypes, isLoading]);

  return context;
};
