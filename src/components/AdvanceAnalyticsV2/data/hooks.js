import { useQuery } from '@tanstack/react-query';

import { advanceAnalyticsQueryKeys } from './constants';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';

export const useEnterpriseSkillsAnalytics = (enterpriseCustomerUUID, startDate, endDate, queryOptions = {}) => {
  const requestOptions = { startDate, endDate };
  return useQuery({
    queryKey: advanceAnalyticsQueryKeys.skills(enterpriseCustomerUUID, requestOptions),
    queryFn: () => EnterpriseDataApiService.fetchAdminAnalyticsSkills(enterpriseCustomerUUID, requestOptions),
    staleTime: 1 * (1000 * 60 * 60), // 1 hour. Length of time before your data becomes stale
    cacheTime: 2 * (1000 * 60 * 60), // 2 hours. Length of time before inactive data gets removed from the cache
    ...queryOptions,
  });
};
