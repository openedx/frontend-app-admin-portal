import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  advanceAnalyticsQueryKeys, COURSE_TYPES, ALL_COURSES,
} from '../constants';

import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

export { default as useEnterpriseEnrollmentsData } from './useEnterpriseEnrollmentsData';
export { default as useEnterpriseEngagementData } from './useEnterpriseEngagementData';
export { default as useEnterpriseCompletionsData } from './useEnterpriseCompletionsData';
export { default as useEnterpriseCourses } from './useEnterpriseCourses';
export { default as useEnterpriseBudgets } from './useEnterpriseBudgets';

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
  courseType = undefined,
  course = undefined,
  budgetUUID = undefined,
  queryOptions = {},
}) => {
  const requestOptions = {
    startDate,
    endDate,
    granularity,
    calculation,
    page: currentPage,
    pageSize,
  };

  if (courseType && courseType !== COURSE_TYPES.ALL_COURSE_TYPES) {
    requestOptions.courseType = courseType;
  }

  if (course?.value && course?.value !== ALL_COURSES.value) {
    requestOptions.courseKey = course.value;
  }

  if (budgetUUID) {
    requestOptions.budgetUUID = budgetUUID;
  }

  if (groupUUID) {
    requestOptions.groupUUID = groupUUID;
  }

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
  tabKey,
  startDate,
  endDate,
  groupUUID = undefined,
  courseType = undefined,
  course = undefined,
  budgetUUID = undefined,
  queryOptions = {},
}) => {
  const requestOptions = {
    startDate,
    endDate,
  };

  if (groupUUID) {
    requestOptions.groupUUID = groupUUID;
  }

  if (courseType && courseType !== COURSE_TYPES.ALL_COURSE_TYPES) {
    requestOptions.courseType = courseType;
  }

  if (course?.value && course?.value !== ALL_COURSES.value) {
    requestOptions.courseKey = course.value;
  }

  if (budgetUUID) {
    requestOptions.budgetUUID = budgetUUID;
  }

  return useQuery({
    queryKey: advanceAnalyticsQueryKeys.aggregates(enterpriseCustomerUUID, requestOptions, tabKey),
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
