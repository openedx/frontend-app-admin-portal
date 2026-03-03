import { createContext, useMemo } from 'react';
import { SUBSIDY_TYPES } from '../../data/constants/subsidyTypes';
import {
  useBillingSubscriptionAvailable,
  useCoupons,
  useCustomerAgreement,
  useEnterpriseBudgets,
} from './data/hooks';

export const EnterpriseSubsidiesContext = createContext();

export const useEnterpriseSubsidiesContext = ({
  enablePortalLearnerCreditManagementScreen,
  enterpriseId,
}) => {
  const {
    isLoading: isLoadingBudgets,
    data: budgetsOverview,
  } = useEnterpriseBudgets({
    enablePortalLearnerCreditManagementScreen,
    enterpriseId,
  });

  const {
    budgets = [],
    canManageLearnerCredit = false,
  } = budgetsOverview || {};

  const {
    customerAgreement,
    isLoading: isLoadingCustomerAgreement,
  } = useCustomerAgreement({ enterpriseId });

  const {
    coupons,
    isLoading: isLoadingCoupons,
  } = useCoupons();

  const {
    hasBillingSubscription,
    isLoading: isLoadingBillingSubscription,
  } = useBillingSubscriptionAvailable({ enterpriseId });

  const enterpriseSubsidyTypes = useMemo(() => {
    const subsidyTypes = [];

    if (budgets.length > 0) {
      subsidyTypes.push(SUBSIDY_TYPES.budget);
    }

    if (coupons.length > 0) {
      subsidyTypes.push(SUBSIDY_TYPES.coupon);
    }

    if (customerAgreement?.subscriptions.length > 0) {
      subsidyTypes.push(SUBSIDY_TYPES.license);
    }
    return subsidyTypes;
  }, [budgets.length, coupons.length, customerAgreement]);

  const isLoading = isLoadingBudgets || isLoadingCustomerAgreement || isLoadingCoupons || isLoadingBillingSubscription;

  const context = useMemo(() => ({
    customerAgreement,
    coupons,
    canManageLearnerCredit,
    enterpriseSubsidyTypes,
    hasBillingSubscription,
    isLoading,
  }), [
    customerAgreement,
    coupons,
    canManageLearnerCredit,
    enterpriseSubsidyTypes,
    hasBillingSubscription,
    isLoading,
  ]);

  return context;
};
