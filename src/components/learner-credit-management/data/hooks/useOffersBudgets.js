import { useEffect, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import { transformBudgetsData } from '../utils';

const useOffersBudgets = (enterpriseUUID, enterpriseOffers) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allBudgets, setAllBudgets] = useState([]);

  useEffect(() => {
    if (!enterpriseOffers) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const budgetsPromises = enterpriseOffers.map(async (offer) => {
          const response = await EnterpriseDataApiService.fetchEnterpriseOfferSummary(enterpriseUUID, offer.id);
          const data = camelCaseObject(response.data);
          return transformBudgetsData(offer, data);
        });
        const budgetsArray = await Promise.all(budgetsPromises);
        const flattenendBudgets = budgetsArray.flat(1);
        setAllBudgets(flattenendBudgets);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enterpriseUUID, enterpriseOffers]);

  return {
    isLoading,
    allBudgets,
  };
};

export default useOffersBudgets;
