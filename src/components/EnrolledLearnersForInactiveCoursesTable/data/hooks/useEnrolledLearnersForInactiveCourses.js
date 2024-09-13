import {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import debounce from 'lodash.debounce';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import EVENT_NAMES from '../../../../eventTracking';

const applySortByToOptions = (sortBy, options) => {
  if (!sortBy || sortBy.length === 0) {
    return;
  }
  const apiFieldsForColumnAccessor = {
    userEmail: { key: 'user_email' },
    enrollmentCount: { key: 'enrollment_count' },
    courseCompletionCount: { key: 'course_completion_count' },
    lastActivityDate: { key: 'last_activity_date' },
  };
  const orderingStrings = sortBy.map(({ id, desc }) => {
    const apiFieldForColumnAccessor = apiFieldsForColumnAccessor[id];
    if (!apiFieldForColumnAccessor) {
      return undefined;
    }
    const apiFieldKey = apiFieldForColumnAccessor.key;
    return desc ? `-${apiFieldKey}` : apiFieldKey;
  }).filter(orderingString => !!orderingString);

  Object.assign(options, {
    ordering: orderingStrings.join(','),
  });
};

const useEnrolledLearnersForInactiveCourses = (enterpriseId) => {
  const shouldTrackFetchEvents = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledLearnersForInactiveCourses, setEnrolledLearnersForInactiveCourses] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  const fetchEnrolledLearnersForInactiveCourses = useCallback(async (args) => {
    try {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1,
        pageSize: args.pageSize,
      };
      applySortByToOptions(args.sortBy, options);

      const response = await EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses(enterpriseId, options);
      const data = camelCaseObject(response.data);
      setEnrolledLearnersForInactiveCourses({
        itemCount: data.count,
        pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
        results: data.results,
      });

      if (shouldTrackFetchEvents.current) {
        sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.PROGRESS_REPORT.DATATABLE_SORT_BY_OR_FILTER,
          {
            tableId: '',
            ...options,
          },
        );
      } else {
        shouldTrackFetchEvents.current = true;
      }
    } catch (error) {
      logError(error);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId]);

  const debouncedFetchEnrolledLearnersForInactiveCourses = useMemo(
    () => debounce(fetchEnrolledLearnersForInactiveCourses, 300),
    [fetchEnrolledLearnersForInactiveCourses],
  );

  return {
    isLoading,
    enrolledLearnersForInactiveCourses,
    fetchEnrolledLearnersForInactiveCourses: debouncedFetchEnrolledLearnersForInactiveCourses,
  };
};

export default useEnrolledLearnersForInactiveCourses;
