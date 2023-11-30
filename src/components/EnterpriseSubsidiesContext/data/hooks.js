import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EcommerceApiService from '../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import SubsidyApiService from '../../../data/services/EnterpriseSubsidyApiService';
import { BUDGET_TYPES } from '../../EnterpriseApp/data/constants';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';

dayjs.extend(isBetween);

export const useEnterpriseBudgets = ({
  enablePortalLearnerCreditManagementScreen,
  enterpriseId,
  isTopDownAssignmentEnabled,
}) => {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canManageLearnerCredit, setCanManageLearnerCredit] = useState(false);

  useEffect(() => {
    const fetchBudgets = async () => {
      setIsLoading(true);
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
        console.log('enterprisePolicyResults', result);
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

      if (budgetsList.length > 0) {
        setBudgets(budgetsList);
        setCanManageLearnerCredit(true);
      }
      setIsLoading(false);
    };

    if (getConfig().FEATURE_LEARNER_CREDIT_MANAGEMENT && enablePortalLearnerCreditManagementScreen) {
      fetchBudgets();
    }
  }, [enablePortalLearnerCreditManagementScreen, enterpriseId, isTopDownAssignmentEnabled]);

  return {
    isLoading,
    budgets,
    canManageLearnerCredit,
  };
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
