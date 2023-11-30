import { useEffect, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import { transformOfferSummary } from '../utils';

const useBudgetSummaryAnalyticsApi = (enterpriseUUID, enterpriseOffer) => {
  const [isLoading, setIsLoading] = useState(true);
  const [offerSummary, setOfferSummary] = useState();

  useEffect(() => {
    if (!enterpriseOffer) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await EnterpriseDataApiService.fetchEnterpriseOfferSummary(enterpriseUUID, enterpriseOffer.id);
        const data = camelCaseObject(response.data);
        const transformedOfferSummary = transformOfferSummary(data);
        setOfferSummary(transformedOfferSummary);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enterpriseUUID, enterpriseOffer]);

  return {
    isLoading,
    offerSummary,
  };
};

export default useBudgetSummaryAnalyticsApi;
