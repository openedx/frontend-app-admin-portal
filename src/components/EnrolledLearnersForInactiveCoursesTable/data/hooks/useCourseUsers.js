import {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import debounce from 'lodash.debounce';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import EVENT_NAMES from '../../../../eventTracking';
import { trackDataTableEvent } from '../LearnerActivityTable/data/utils';

const applySortByToOptions = (sortBy, apiFieldsForColumnAccessor, options) => {
  if (!sortBy || sortBy.length === 0) {
    return;
  }
  const orderingStrings = sortBy.map(({ id, desc }) => {
    const fieldForColumnAccessor = apiFieldsForColumnAccessor[id];
    if (!fieldForColumnAccessor) {
      return undefined;
    }
    const apiFieldKey = fieldForColumnAccessor.key;
    return desc ? `-${apiFieldKey}` : apiFieldKey;
  }).filter(orderingString => !!orderingString);
  Object.assign(options, {
    ordering: orderingStrings.join(','),
  });
};

const useCourseUsers = (enterpriseId, tableId, apiFieldsForColumnAccessor) => {
  const shouldTrackFetchEvents = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseUsers, setCourseUsers] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  const fetchCourseUsers = useCallback(async (args) => {
    try {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1,
        pageSize: args.pageSize,
      };
      applySortByToOptions(args.sortBy, apiFieldsForColumnAccessor, options);

      const response = await EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses(enterpriseId, options);
      const data = camelCaseObject(response.data);
      setCourseUsers({
        itemCount: data.count,
        pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
        results: data.results,
      });
      trackDataTableEvent({
        shouldTrackRef: shouldTrackFetchEvents,
        enterpriseId,
        eventName: EVENT_NAMES.PROGRESS_REPORT.DATATABLE_SORT_BY_OR_FILTER,
        tableId,
        options,
      });
    } catch (error) {
      // Enhanced error logging with table state context
      logError(error, {
        tableState: {
          tableId,
          enterpriseId,
          filters: args.filters || 'none',
          sortBy: JSON.stringify(args.sortBy || []),
        },
        message: `Error fetching course users for table ${tableId}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId, tableId, apiFieldsForColumnAccessor]);

  const debouncedFetchCourseUsers = useMemo(
    () => debounce(fetchCourseUsers, 300),
    [fetchCourseUsers],
  );

  // Add a computed property to check if data exists
  const hasData = useMemo(
    () => courseUsers.results.length > 0,
    [courseUsers.results],
  );

  return {
    isLoading,
    courseUsers,
    fetchCourseUsers: debouncedFetchCourseUsers,
    hasData,
  };
};

export default useCourseUsers;
