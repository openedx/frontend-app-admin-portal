import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import { COURSE_TYPES, generateKey, ALL_COURSES } from '../constants';

/**
 * Transforms course API response into search/select compatible options.
 * @param {Array} courses - Array of course objects from the API.
 * @returns {Array} An array of { value, label } objects.
 */
export const transformCourseOptions = (courses = []) => {
  const transformedCourses = courses.map(course => ({
    value: course?.courseKey ?? '',
    label: course?.courseTitle ?? '',
  }));

  return [ALL_COURSES, ...transformedCourses];
};

/**
 * Fetches available courses for a given enterprise customer and filters.
 *
 * @param {String} enterpriseCustomerUUID - Required: Enterprise customer UUID.
 * @param {String} groupUUID - Optional group UUID.
 * @param {String} startDate - Optional start date (YYYY-MM-DD).
 * @param {String} endDate - Optional end date (YYYY-MM-DD).
 * @param {String} courseType - Optional course type filter.
 * @param {Object} queryOptions - Additional React Query options.
 */
const useEnterpriseCourses = ({
  enterpriseCustomerUUID,
  startDate,
  endDate,
  groupUUID = undefined,
  courseType = undefined,
  queryOptions = {},
}) => {
  const requestOptions = {
    startDate,
    endDate,
    groupUUID,
  };

  if (courseType && courseType !== COURSE_TYPES.ALL_COURSE_TYPES) {
    requestOptions.courseType = courseType;
  }

  const response = useQuery({
    queryKey: generateKey('enterprise-course', enterpriseCustomerUUID, requestOptions),
    queryFn: () => EnterpriseDataApiService.fetchEnterpriseCourses(
      enterpriseCustomerUUID,
      requestOptions,
    ),
    staleTime: 0.5 * (1000 * 60 * 60), // 30 minutes. The time in milliseconds after data is considered stale.
    cacheTime: 0.75 * (1000 * 60 * 60), // 45 minutes. Cache data will be garbage collected after this duration.
    keepPreviousData: true,
    ...queryOptions,
  });

  return useMemo(() => ({
    data: transformCourseOptions(response?.data),
    isFetching: response?.isFetching,
  }), [response]);
};

export default useEnterpriseCourses;
