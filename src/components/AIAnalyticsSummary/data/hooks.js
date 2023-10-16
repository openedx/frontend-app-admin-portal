import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import LmsApiService from '../../../data/services/LmsApiService';

const useAIAnalyticsSummary = (enterpriseId, insights) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsSummaryData, setAnalyticsSummaryData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await LmsApiService.generateAIAnalyticsSummary(enterpriseId, insights);
        setAnalyticsSummaryData(response.data);
      } catch (err) {
        setError(err);
        logError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (enterpriseId && insights) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [enterpriseId, insights]);

  return {
    isLoading,
    error,
    data: analyticsSummaryData,
  };
};

export default useAIAnalyticsSummary;
