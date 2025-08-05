/**
 * Placeholder for Enterprise Courses Hook
 *
 * This hook is a temporary placeholder while the Enterprise Courses API is under development.
 * It returns an empty array and sets `isLoading` to false to prevent any loading states.
 *
 * Once the API is ready, replace this placeholder with the actual data-fetching logic
 * and use `transformCourseOptions` to format the response into { value, label } pairs.
 */

import { useMemo } from 'react';

/**
 * Transforms course API response into select-compatible options.
 * @param {Array} courses - Array of course objects from the API.
 * @returns {Array} An array of { value, label } objects.
 */
export const transformCourseOptions = (courses = []) => courses.map(course => ({
  value: course?.course_key ?? '',
  label: course?.course_title ?? '',
}));

/**
 * Returns empty data and loading: false while API is under development.
 */
const useEnterpriseCourses = () => useMemo(() => ({
  data: transformCourseOptions([]),
  isLoading: false,
}), []);

export default useEnterpriseCourses;
