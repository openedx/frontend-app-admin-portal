import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EcommerceApiService from '../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import SubsidyApiService from '../../../data/services/EnterpriseSubsidyApiService';
import { BUDGET_TYPES } from '../../EnterpriseApp/data/constants';

export const useEnterpriseOffers = ({ enablePortalLearnerCreditManagementScreen, enterpriseId }) => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canManageLearnerCredit, setCanManageLearnerCredit] = useState(false);

  dayjs.extend(isSameOrBefore);
  dayjs.extend(isSameOrAfter);

  useEffect(() => {
    setIsLoading(true);
    const fetchOffers = async () => {
      try {
        const [enterpriseSubsidyResponse, ecommerceApiResponse] = await Promise.all([
          SubsidyApiService.getSubsidyByCustomerUUID(enterpriseId, { subsidyType: 'learner_credit' }),
          EcommerceApiService.fetchEnterpriseOffers(),
        ]);

        // We have to consider both type of offers active and inactive.

        const enterpriseSubsidyResults = camelCaseObject(enterpriseSubsidyResponse.data).results;
        const ecommerceOffersResults = camelCaseObject(ecommerceApiResponse.data.results);

        const offerData = [];

        enterpriseSubsidyResults.forEach((result) => {
          offerData.push({
            source: BUDGET_TYPES.subsidy,
            id: result.uuid,
            name: result.title,
            start: result.activeDatetime,
            end: result.expirationDatetime,
            isCurrent: result.isActive,
          });
        });

        ecommerceOffersResults.forEach((result) => {
          offerData.push({
            source: BUDGET_TYPES.ecommerce,
            id: (result.id).toString(),
            name: result.displayName,
            start: result.startDatetime,
            end: result.endDatetime,
            isCurrent: result.isCurrent,
          });
        });
        setOffers(offerData);
        if (offerData.length > 0) {
          setCanManageLearnerCredit(true);
        }
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (getConfig().FEATURE_LEARNER_CREDIT_MANAGEMENT
      && enablePortalLearnerCreditManagementScreen) {
      fetchOffers();
    } else {
      setIsLoading(false);
    }
  }, [enablePortalLearnerCreditManagementScreen, enterpriseId]);

  return {
    isLoading,
    offers,
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
