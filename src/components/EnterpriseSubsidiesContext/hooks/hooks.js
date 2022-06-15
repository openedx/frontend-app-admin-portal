import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EcommerceApiService from '../../../data/services/EcommerceApiService';

// eslint-disable-next-line import/prefer-default-export
export const useEnterpriseOffers = (enterpriseId) => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canManageLearnerCredit, setCanManageLearnerCredit] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await EcommerceApiService.fetchEnterpriseOffers(enterpriseId);
        const { results } = camelCaseObject(response.data);
        setOffers(results);

        if (results.length === 1) {
          setCanManageLearnerCredit(true);
        }
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (getConfig().FEATURE_LEARNER_CREDIT_MANAGEMENT) {
      fetchOffers();
    } else {
      setIsLoading(false);
    }
  }, [enterpriseId]);

  return {
    isLoading,
    offers,
    canManageLearnerCredit,
  };
};
