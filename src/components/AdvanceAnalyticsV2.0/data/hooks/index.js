import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { advanceAnalyticsQueryKeys } from '../constants';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

export { default as useEnterpriseEnrollmentsData } from './useEnterpriseEnrollmentsData';
export { default as useEnterpriseEngagementData } from './useEnterpriseEngagementData';
export { default as useEnterpriseCompletionsData } from './useEnterpriseCompletionsData';

export const useEnterpriseAnalyticsData = ({
  enterpriseCustomerUUID,
  key,
  startDate,
  endDate,
  granularity = undefined,
  calculation = undefined,
  groupUUID = undefined,
  currentPage = undefined,
  pageSize = undefined,
  queryOptions = {},
}) => {
  const requestOptions = {
    startDate, endDate, granularity, calculation, page: currentPage, pageSize, groupUUID,
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

export const useEnterpriseAnalyticsAggregatesData = ({
  enterpriseCustomerUUID,
  startDate,
  endDate,
  queryOptions = {},
}) => {
  const requestOptions = {
    startDate, endDate,
  };
  return useQuery({
    queryKey: advanceAnalyticsQueryKeys.aggregates(enterpriseCustomerUUID, requestOptions),
    queryFn: () => EnterpriseDataApiService.fetchAdminAggregatesData(
      enterpriseCustomerUUID,
      requestOptions,
    ),
    staleTime: 0.5 * (1000 * 60 * 60), // 30 minutes. The time in milliseconds after data is considered stale.
    cacheTime: 0.75 * (1000 * 60 * 60), // 45 minutes. Cache data will be garbage collected after this duration.
    keepPreviousData: true,
    ...queryOptions,
  });
};
