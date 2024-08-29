import { useMemo } from 'react';
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

export const useEnterpriseAnalyticsTableData = (
  enterpriseCustomerUUID,
  tableKey,
  startDate,
  endDate,
  currentPage,
  queryOptions = {},
) => {
  const requestOptions = { startDate, endDate, page: currentPage };
  return useQuery({
    queryKey: advanceAnalyticsQueryKeys[tableKey](enterpriseCustomerUUID, requestOptions),
    queryFn: () => EnterpriseDataApiService.fetchAdminAnalyticsTableData(
      enterpriseCustomerUUID,
      tableKey,
      requestOptions,
    ),
    select: (respnose) => respnose.data,
    staleTime: 0.5 * (1000 * 60 * 60), // 30 minutes. Length of time before your data becomes stale
    cacheTime: 0.75 * (1000 * 60 * 60), // 45 minutes. Length of time before inactive data gets removed from the cache
    keepPreviousData: true,
    ...queryOptions,
  });
};

export const usePaginatedData = (data) => useMemo(() => {
  if (data) {
    return {
      data: data.results,
      pageCount: data.num_pages,
      itemCount: data.count,
      currentPage: data.current_page,
    };
  }

  return {
    itemCount: 0,
    pageCount: 0,
    data: [],
  };
}, [data]);
