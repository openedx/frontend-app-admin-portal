import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';
import { useQuery } from '@tanstack/react-query';

import EcommerceApiService from '../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import SubsidyApiService from '../../../data/services/EnterpriseSubsidyApiService';
import { BUDGET_TYPES } from '../../EnterpriseApp/data/constants';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../../learner-credit-management/data';
import { isAssignableSubsidyAccessPolicyType } from '../../../utils';

dayjs.extend(isBetween);

async function fetchEnterpriseBudgets({
  isTopDownAssignmentEnabled,
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
  const budgetPromisesToFulfill = isTopDownAssignmentEnabled
    ? [undefined, EnterpriseAccessApiService.listSubsidyAccessPolicies(enterpriseId)]
    : [SubsidyApiService.getSubsidyByCustomerUUID(enterpriseId, { subsidyType: 'learner_credit' }), undefined];

  // Always prepend the promise to fetch ecommerce offers
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

  // Transform the API responses
  const ecommerceOffersResults = camelCaseObject(ecommerceApiResponse.value?.data.results);
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
  isTopDownAssignmentEnabled,
  queryOptions = {},
}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.budgets(enterpriseId),
  queryFn: (args) => fetchEnterpriseBudgets({
    queryArgs: args,
    isTopDownAssignmentEnabled,
    enterpriseId,
    enablePortalLearnerCreditManagementScreen,
  }),
  ...queryOptions,
});

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
