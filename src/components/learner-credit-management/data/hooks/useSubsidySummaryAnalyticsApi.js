import { useEffect, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import { transformSubsidySummary } from '../utils';
import { BUDGET_TYPES } from '../../../EnterpriseApp/data/constants';

const useSubsidySummaryAnalyticsApi = (enterpriseUUID, budget) => {
  const [isLoading, setIsLoading] = useState(true);
  const [subsidySummary, setSubsidySummary] = useState();

  useEffect(() => {
    // If there is no budget, or the budget is NOT an ecommerce offer or subsidy, fetch the
    // subsidy summary data from the analytics API.
    if (![BUDGET_TYPES.ecommerce, BUDGET_TYPES.subsidy].includes(budget?.source)) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await EnterpriseDataApiService.fetchEnterpriseOfferSummary(
          enterpriseUUID,
          budget.id,
        );
        const data = camelCaseObject(response.data);
        const transformedSubsidySummary = transformSubsidySummary(data);
        setSubsidySummary(transformedSubsidySummary);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enterpriseUUID, budget]);

  return {
    isLoading,
    subsidySummary,
  };
};

export default useSubsidySummaryAnalyticsApi;
