import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { advanceAnalyticsQueryKeys } from './constants';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';

export const useEnterpriseAnalyticsData = ({
  enterpriseCustomerUUID,
  key,
  startDate,
  endDate,
  granularity = undefined,
  calculation = undefined,
  currentPage = undefined,
  queryOptions = {},
}) => {
  const requestOptions = {
    startDate, endDate, granularity, calculation, page: currentPage,
  };
  return useQuery({
    queryKey: advanceAnalyticsQueryKeys[key](enterpriseCustomerUUID, requestOptions),
    queryFn: () => EnterpriseDataApiService.fetchAdminAnalyticsData(
      enterpriseCustomerUUID,
      key,
      requestOptions,
    ),
    staleTime: 0.5 * (1000 * 60 * 60), // 30 minutes. The time in milliseconds after data is considered stale.
    cacheTime: 0.75 * (1000 * 60 * 60), // 45 minutes. Cache data will be garbage collected after this duration.
    keepPreviousData: true,
    ...queryOptions,
  });
};

export const usePaginatedData = (data) => useMemo(() => {
  if (data) {
    return {
      data: data.results,
      pageCount: data.numPages,
      itemCount: data.count,
      currentPage: data.currentPage,
    };
  }

  return {
    itemCount: 0,
    pageCount: 0,
    data: [],
  };
}, [data]);
