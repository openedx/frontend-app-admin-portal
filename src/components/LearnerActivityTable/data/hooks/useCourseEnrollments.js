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
    courseTitle: { key: 'course_title' },
    courseListPrice: { key: 'course_list_price' },
    courseStartDate: { key: 'course_start_date' },
    courseEndDate: { key: 'course_end_date' },
    passedDate: { key: 'passed_date' },
    currentGrade: { key: 'current_grade' },
    progressStatus: { key: 'progress_status' },
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

const useCourseEnrollments = (enterpriseId, tableId) => {
  const shouldTrackFetchEvents = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseEnrollments, setCourseEnrollments] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  const fetchCourseEnrollments = useCallback(async (args) => {
    try {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1,
        pageSize: args.pageSize,
      };
      applySortByToOptions(args.sortBy, options);

      const response = await EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, options);
      const data = camelCaseObject(response.data);
      setCourseEnrollments({
        itemCount: data.count,
        pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
        results: data.results,
      });
      if (shouldTrackFetchEvents.current) {
        // track event only after original API query to avoid sending event on initial page load. instead,
        // only track event when user performs manual data operation (e.g., pagination, sort, filter) and
        // send all table state as event properties.
        sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.PROGRESS_REPORT.DATATABLE_SORT_BY_OR_FILTER,
          {
            tableId,
            ...options,
          },
        );
      } else {
        // set to true to enable tracking events on future API queries
        shouldTrackFetchEvents.current = true;
      }
    } catch (error) {
      logError(error);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId, tableId]);

  const debouncedFetchCourseEnrollments = useMemo(
    () => debounce(fetchCourseEnrollments, 300),
    [fetchCourseEnrollments],
  );

  return {
    isLoading,
    courseEnrollments,
    fetchCourseEnrollments: debouncedFetchCourseEnrollments,
  };
};

export default useCourseEnrollments;
