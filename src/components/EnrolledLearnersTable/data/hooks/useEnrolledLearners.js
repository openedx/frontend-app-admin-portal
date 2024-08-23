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
    lmsUserCreated: { key: 'lms_user_created' },
    userEmail: { key: 'user_email' },
    enrollmentCount: { key: 'enrollment_count' },
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

const applyFiltersToOptions = (filters, options) => {
  if (!filters || filters.length === 0) {
    return;
  }
  const userEmailFilter = filters.find(filter => filter.id === 'userEmail')?.value;
  if (userEmailFilter) {
    Object.assign(options, { userEmail: userEmailFilter });
  }
};

const useEnrolledLearners = (enterpriseId) => {
  const shouldTrackFetchEvents = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledLearners, setEnrolledLearners] = useState(
    {
      itemCount: 0,
      pageCount: 0,
      results: [],
    },
  );

  const fetchEnrolledLearners = useCallback(async (args) => {
    try {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1,
        pageSize: args.pageSize,
      };
      applySortByToOptions(args.sortBy, options);
      applyFiltersToOptions(args.filters, options);

      const response = await EnterpriseDataApiService.fetchEnrolledLearners(enterpriseId, options);
      const data = camelCaseObject(response.data);
      setEnrolledLearners({
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
            tableId: 'enrolled-learners',
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
  }, [enterpriseId]);

  const debouncedFetchEnrolledLearners = useMemo(
    () => debounce(fetchEnrolledLearners, 300),
    [fetchEnrolledLearners],
  );

  return {
    isLoading,
    enrolledLearners,
    fetchEnrolledLearners: debouncedFetchEnrolledLearners,
  };
};

export default useEnrolledLearners;
