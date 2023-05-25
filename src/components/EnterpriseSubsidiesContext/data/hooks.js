import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import moment from 'moment';

import EcommerceApiService from '../../../data/services/EcommerceApiService';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import SubsidyApiService from '../../../data/services/EnterpriseSubsidyApiService';

export const useEnterpriseOffers = ({ enablePortalLearnerCreditManagementScreen, enterpriseId }) => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canManageLearnerCredit, setCanManageLearnerCredit] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchOffers = async () => {
      try {
        const [enterpriseSubsidyResponse, ecommerceApiResponse] = await Promise.all([
          SubsidyApiService.getSubsidyByCustomerUUID(enterpriseId),
          EcommerceApiService.fetchEnterpriseOffers({
            isCurrent: true,
          }),
        ]);

        // If there are no subsidies in enterprise, fall back to the e-commerce API.
        let { results } = camelCaseObject(enterpriseSubsidyResponse.data);
        let source = 'subsidyApi';

        if (results.length === 0) {
          results = camelCaseObject(ecommerceApiResponse.data.results);
          source = 'ecommerceApi';
        }

        if (results.length !== 0) {
          const subsidy = results[0];
          const isCurrent = source === 'ecommerceApi'
            ? subsidy.isCurrent
            : moment().isSameOrBefore(subsidy.expirationDatetime)
            && moment().isSameOrAfter(subsidy.activeDatetime);
          const offerData = {
            id: subsidy.uuid || subsidy.id,
            name: subsidy.title || subsidy.displayName,
            start: subsidy.activeDatetime || subsidy.startDatetime,
            end: subsidy.expirationDatetime || subsidy.endDatetime,
            isCurrent,
          };
          setOffers([offerData]);
        }
        // We only released learner credit management to customers with 1 offer for the MVP.
        if (results.length === 1) {
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
