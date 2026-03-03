import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';
import { useQuery } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';

import EcommerceApiService from '../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import { BUDGET_TYPES } from '../../EnterpriseApp/data/constants';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys, isBudgetRetiredOrExpired, getBudgetStatus } from '../../learner-credit-management/data';
import { isAssignableSubsidyAccessPolicyType } from '../../../utils';
import { billingQueryKeys } from '../../billing/data/constants';

dayjs.extend(isBetween);

async function fetchEnterpriseBudgets({
  enterpriseId,
  enablePortalLearnerCreditManagementScreen,
}) {
  // If the LC2 feature is disabled, do nothing.
  if (!getConfig().FEATURE_LEARNER_CREDIT_MANAGEMENT || !enablePortalLearnerCreditManagementScreen) {
    return {
      budgets: [],
      canManageLearnerCredit: false,
    };
  }

  // Call the appropriate API based on the feature flag
  // Fetch subsidy access policies (top-down learner credit management is enabled by default)
  const budgetPromisesToFulfill = [
    undefined,
    EnterpriseAccessApiService.listSubsidyAccessPolicies(enterpriseId),
  ];
  // Attempt to fetch enterprise offers with graceful error handling
  budgetPromisesToFulfill.unshift(EcommerceApiService.fetchEnterpriseOffers());

  // Attempt to resolve all promises
  const [
    ecommerceApiResponse,
    enterpriseSubsidyResponse,
    enterprisePolicyResponse,
  ] = await Promise.allSettled(budgetPromisesToFulfill);

  // Log any errors
  if (ecommerceApiResponse.status === 'rejected') {
    logError(ecommerceApiResponse.reason);
  }
  if (enterpriseSubsidyResponse.status === 'rejected') {
    logError(enterpriseSubsidyResponse.reason);
  }
  if (enterprisePolicyResponse.status === 'rejected') {
    logError(enterprisePolicyResponse.reason);
  }

  // Transform the API responses - handle ecommerce API gracefully if it fails
  const ecommerceOffersResults = ecommerceApiResponse.status === 'fulfilled'
    ? camelCaseObject(ecommerceApiResponse.value?.data.results)
    : []; // Return empty array if ecommerce API fails
  const enterpriseSubsidyResults = camelCaseObject(enterpriseSubsidyResponse.value?.data.results);
  const enterprisePolicyResults = camelCaseObject(enterprisePolicyResponse.value?.data.results);

  // Iterate through each API response (if applicable) and concatenate the results into a single array of budgets.
  const budgetsList = [];
  enterprisePolicyResults?.forEach((result) => {
    budgetsList.push({
      source: BUDGET_TYPES.policy,
      id: result.uuid,
      name: result.displayName || 'Overview',
      start: result.subsidyActiveDatetime,
      end: result.subsidyExpirationDatetime,
      isCurrent: dayjs().isBetween(result.subsidyActiveDatetime, result.subsidyExpirationDatetime, 'day', '[]'),
      aggregates: {
        available: result.aggregates.spendAvailableUsd,
        spent: result.aggregates.amountRedeemedUsd,
        pending: result.aggregates.amountAllocatedUsd,
      },
      isAssignable: isAssignableSubsidyAccessPolicyType(result),
      isBnREnabled: result.bnrEnabled,
      isRetired: result.retired,
      retiredAt: result.retiredAt,
    });
  });
  enterpriseSubsidyResults?.forEach((result) => {
    budgetsList.push({
      source: BUDGET_TYPES.subsidy,
      id: result.uuid,
      name: result.title,
      start: result.activeDatetime,
      end: result.expirationDatetime,
      isCurrent: result.isActive,
    });
  });
  // Add ecommerce offers if available (graceful degradation if API fails)
  ecommerceOffersResults?.forEach((result) => {
    budgetsList.push({
      source: BUDGET_TYPES.ecommerce,
      id: (result.id).toString(),
      name: result.displayName,
      start: result.startDatetime,
      end: result.endDatetime,
      isCurrent: result.isCurrent,
    });
  });

  return {
    budgets: budgetsList,
    canManageLearnerCredit: budgetsList.length > 0,
  };
}

export const useEnterpriseBudgets = ({
  enablePortalLearnerCreditManagementScreen,
  enterpriseId,
  queryOptions = {},
}) => {
  const intl = useIntl();

  return useQuery({
    queryKey: learnerCreditManagementQueryKeys.budgets(enterpriseId),
    queryFn: (args) => fetchEnterpriseBudgets({
      queryArgs: args,
      enterpriseId,
      enablePortalLearnerCreditManagementScreen,
    }),
    select: (data) => {
      if (!data?.budgets) {
        return data;
      }

      const updatedBudgets = data.budgets.map(budget => {
        if (budget.source === BUDGET_TYPES.policy) {
          const { status } = getBudgetStatus({
            intl,
            startDateStr: budget.start,
            endDateStr: budget.end,
            isBudgetRetired: budget.isRetired,
          });
          return {
            ...budget,
            isRetiredOrExpired: isBudgetRetiredOrExpired(status),
          };
        }
        return budget;
      });

      const transformedData = {
        ...data,
        budgets: updatedBudgets,
      };

      if (queryOptions.select) {
        return queryOptions.select(transformedData);
      }

      return transformedData;
    },
  });
};

export const useCustomerAgreement = ({ enterpriseId }) => {
  const [customerAgreement, setCustomerAgreement] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerAgreement = async () => {
      try {
        const response = await LicenseManagerApiService.fetchCustomerAgreementData({
          enterprise_customer_uuid: enterpriseId,
        });
        const { results } = camelCaseObject(response.data);
        if (results.length > 0) {
          setCustomerAgreement(results[0]);
        }
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerAgreement();
  }, [enterpriseId]);

  return {
    customerAgreement,
    isLoading,
  };
};

export const useCoupons = (options) => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        // We are more interested in the existence of coupons here rather than fetching all of them.
        const response = await EcommerceApiService.fetchCouponOrders(options);
        const { results } = camelCaseObject(response.data);
        setCoupons(results);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [options]);

  return {
    coupons,
    isLoading,
  };
};

/**
 * Hook to check if billing subscription is available from the billing-management API.
 * Returns true only if the API returns a valid subscription (not null/404).
 * Gracefully handles errors by returning false (hide billing tab on errors).
 *
 * Uses React Query to enable caching and deduplication with the useSubscription hook
 * in billing/data/hooks.ts, avoiding duplicate API calls for the same subscription data.
 */
export const useBillingSubscriptionAvailable = ({ enterpriseId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: billingQueryKeys.subscription(enterpriseId),
    queryFn: async () => {
      const response = await EnterpriseAccessApiService.getSubscription(enterpriseId);
      // Return the same shape as useSubscription for cache compatibility
      return response.data.subscription ?? response.data;
    },
    // Transform the full subscription response to just a boolean for this hook
    select: (subscriptionData) => !!subscriptionData,
    // Gracefully handle errors - log but don't throw
    retry: false,
    onError: (error) => {
      logError(error);
    },
  });

  // Return false if there's an error (404 or other) or if data is falsy
  const hasBillingSubscription = isError ? false : (data ?? false);

  return {
    hasBillingSubscription,
    isLoading,
  };
};
