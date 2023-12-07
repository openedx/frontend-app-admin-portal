import { createContext, useMemo } from 'react';
import { SUBSIDY_TYPES } from '../../data/constants/subsidyTypes';
import { useCoupons, useCustomerAgreement, useEnterpriseBudgets } from './data/hooks';

export const EnterpriseSubsidiesContext = createContext();

export const useEnterpriseSubsidiesContext = ({
  enablePortalLearnerCreditManagementScreen,
  enterpriseId,
  isTopDownAssignmentEnabled,
}) => {
  const {
    isLoading: isLoadingBudgets,
    isFetching: isFetchingBudgets,
    data: budgetsOverview,
  } = useEnterpriseBudgets({
    enablePortalLearnerCreditManagementScreen,
    enterpriseId,
    isTopDownAssignmentEnabled,
  });
  console.log(isLoadingBudgets, isFetchingBudgets, budgetsOverview)
  console.log(enablePortalLearnerCreditManagementScreen, enterpriseId, isTopDownAssignmentEnabled )
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

  const isLoading = isLoadingBudgets || isLoadingCustomerAgreement || isLoadingCoupons;

  const context = useMemo(() => ({
    budgets,
    customerAgreement,
    coupons,
    canManageLearnerCredit,
    enterpriseSubsidyTypes,
    isLoading,
    isFetchingBudgets,
  }), [
    budgets,
    customerAgreement,
    coupons,
    canManageLearnerCredit,
    enterpriseSubsidyTypes,
    isLoading,
    isFetchingBudgets,
  ]);

  return context;
};
