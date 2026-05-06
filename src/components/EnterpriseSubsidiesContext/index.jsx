import { createContext, useMemo } from 'react';
import { SUBSIDY_TYPES } from '../../data/constants/subsidyTypes';
import {
  useBillingSubscriptionAvailable,
  useCoupons,
  useCustomerAgreement,
  useEnterpriseBudgets,
} from './data/hooks';

/**
 * @typedef {{ subscriptions: unknown[] } & Record<string, unknown>} CustomerAgreement
 *
 * @type {import('react').Context<{
 *   customerAgreement: CustomerAgreement | undefined;
 *   coupons: unknown[];
 *   canManageLearnerCredit: boolean;
 *   enterpriseSubsidyTypes: string[];
 *   hasBillingSubscription: boolean;
 *   isLoading: boolean;
 *   isLoadingCustomerAgreement: boolean;
 * }>}
 */
export const EnterpriseSubsidiesContext = createContext({
  customerAgreement: undefined,
  coupons: [],
  canManageLearnerCredit: false,
  enterpriseSubsidyTypes: [],
  hasBillingSubscription: false,
  isLoading: false,
  isLoadingCustomerAgreement: false,
});

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
    isLoadingCustomerAgreement,
  }), [
    customerAgreement,
    coupons,
    canManageLearnerCredit,
    enterpriseSubsidyTypes,
    hasBillingSubscription,
    isLoading,
    isLoadingCustomerAgreement,
  ]);

  return context;
};
