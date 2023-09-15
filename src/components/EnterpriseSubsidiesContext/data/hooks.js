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
          EcommerceApiService.fetchEnterpriseOffers({
            isCurrent: true,
          }),
        ]);

        // We have to conside both type of offers active and inactive.

        const enterpriseResults = camelCaseObject(enterpriseSubsidyResponse.data).results;
        const ecommerceResults = camelCaseObject(ecommerceApiResponse.data.results);

        const offerData = [];

        for (let i = 0; i < enterpriseResults.length; i++) {
          const subsidy = enterpriseResults[i];
          const source = 'subsidyApi';
          const { isActive } = subsidy; // Always check isActive for enterprise subsidies
          const isCurrent = isActive; // You can adjust this based on your specific requirements
          const activeSubsidyData = {
            id: subsidy.uuid,
            name: subsidy.title,
            start: subsidy.activeDatetime,
            end: subsidy.expirationDatetime,
            isCurrent,
            source,
          };
          offerData.push(activeSubsidyData);
          if (isActive) {
            setCanManageLearnerCredit(true);
          }
        }

        for (let i = 0; i < ecommerceResults.length; i++) {
          const subsidy = ecommerceResults[i];
          const source = 'ecommerceApi';
          const { isCurrent } = subsidy;
          const activeSubsidyData = {
            id: subsidy.id,
            name: subsidy.displayName,
            start: subsidy.startDatetime,
            end: subsidy.endDatetime,
            isCurrent,
            source,
          };
          offerData.push(activeSubsidyData);
          if (isCurrent) {
            setCanManageLearnerCredit(true);
          }
        }

        setOffers(offerData);
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
