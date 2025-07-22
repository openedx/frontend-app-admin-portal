import {
  useCallback, useMemo, useState, useRef,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { debounce } from 'lodash-es';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { REQUEST_STATUS_FILTER_CHOICES, REQUEST_TAB_VISIBLE_STATES } from '../constants';

const initialBnrRequestsState = {
  results: [],
  itemCount: 0,
  pageCount: 0,
  currentPage: 1,
};

// Map table column accessors to API field names for sorting
const API_FIELDS_BY_TABLE_COLUMN_ACCESSOR = {
  requestDetails: 'requestDetails',
  amount: 'amount',
  requestDate: 'requestDate',
  requestStatus: 'requestStatus',
  lastActionStatus: 'latest_action__status',
  lastActionErrorReason: 'latest_action__error_reason',
  recentAction: 'latest_action__recent_action',
};

export const applySortByToOptions = (sortBy, options) => {
  if (!sortBy || sortBy.length === 0) {
    return;
  }
  const orderingStrings = sortBy.map(({ id, desc }) => {
    const apiFieldForColumnAccessor = API_FIELDS_BY_TABLE_COLUMN_ACCESSOR[id];
    if (!apiFieldForColumnAccessor) {
      logError(`useBnrSubsidyRequests was unable to find an API field for table column accessor: ${id}`);
      return undefined;
    }
    return desc ? `-${apiFieldForColumnAccessor}` : apiFieldForColumnAccessor;
  }).filter(Boolean);

  if (orderingStrings.length > 0) {
    Object.assign(options, {
      ordering: orderingStrings.join(','),
    });
  }
};

// Configuration mapping for filter field transformations
const FILTER_FIELD_CONFIG = {
  requestDetails: {
    apiParam: 'search',
    transform: (value) => value,
  },
  requestStatus: {
    apiParam: 'state',
    transform: (value) => (Array.isArray(value) ? value.join(',') : value),
  },
  lastActionStatus: {
    apiParam: 'action_status',
    transform: (value) => (Array.isArray(value) ? value.join(',') : value),
  },
  lastActionErrorReason: {
    apiParam: 'action_error_reason',
    transform: (value) => (Array.isArray(value) ? value.join(',') : value),
  },
};

export const applyFiltersToOptions = (filters, options) => {
  if (!filters || filters.length === 0) {
    return;
  }

  filters.forEach(filter => {
    const config = FILTER_FIELD_CONFIG[filter.id];

    if (config && filter.value) {
      if (Array.isArray(filter.value) && filter.value.length === 0) {
        return;
      }
      if (typeof filter.value === 'string' && !filter.value.trim()) {
        return;
      }

      const transformedValue = config.transform(filter.value);
      Object.assign(options, { [config.apiParam]: transformedValue });
    }
  });
};

// Transform API response data to match DataTable the requirements
const transformApiDataToTableData = (apiResults) => apiResults.map((item) => {
  const requestDate = new Date(item.created).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const lastActionDate = new Date(item?.latestAction?.created).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return {
    uuid: item?.uuid,
    email: item?.email,
    courseTitle: item?.courseTitle,
    courseId: item?.courseId,
    amount: item?.coursePrice || 0,
    requestDate,
    requestStatus: item?.state,
    lastActionStatus: item?.latestAction?.status, // Direct assignment, no transformation
    lastActionErrorReason: item?.latestAction?.errorReason, // Use error_reason field
    lastActionDate,
    latestAction: item?.latestAction,
  };
});

const useBnrSubsidyRequests = ({
  enterpriseId,
  isEnabled = true,
}) => {
  const currentArgsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bnrRequests, setBnrRequests] = useState(initialBnrRequestsState);

  const fetchBnrRequests = useCallback(async (args) => {
    if (!isEnabled || !enterpriseId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1,
        page_size: args.pageSize,
        state: REQUEST_TAB_VISIBLE_STATES.join(','),
      };
      applyFiltersToOptions(args.filters, options);
      applySortByToOptions(args.sortBy, options);

      /* This logic in conjunction with useRef is being used to prevent track events
      from being called when the page re-renders without the specifically selected
      arguments (argCopy) being changed */
      const argsCopy = {
        pageIndex: args.pageIndex,
        pageSize: args.pageSize || 10,
        filters: args.filters,
        sortBy: args.sortBy,
      };

      // TODO: Add tracking event for BNR requests datatable sort/filter when proper event name is determined

      const response = await EnterpriseAccessApiService.fetchBnrSubsidyRequests(
        enterpriseId,
        options,
      );
      const data = camelCaseObject(response.data);
      const transformedResults = transformApiDataToTableData(data.results || []);

      setBnrRequests({
        itemCount: data.count || 0,
        pageCount: data.numPages || Math.ceil((data.count || 0) / (options.page_size || 10)),
        results: transformedResults || [],
        currentPage: options.page,
      });
      setIsLoading(false);

      // Memoizes argsCopy to be referenced against future re-renders
      currentArgsRef.current = argsCopy;
    } catch (error) {
      logError('Failed to fetch BNR subsidy requests', error);
      setIsLoading(false);
    }
  }, [isEnabled, enterpriseId]);

  const debouncedFetchBnrRequests = useMemo(
    () => debounce(fetchBnrRequests, 300),
    [fetchBnrRequests],
  );

  // Use stored args when refreshing
  const refreshRequests = useCallback(() => {
    fetchBnrRequests(currentArgsRef.current);
  }, [fetchBnrRequests]);

  const updateRequestStatus = useCallback(({ request, newStatus }) => {
    setBnrRequests(prevState => ({
      ...prevState,
      results: prevState.results.map(req => (req.uuid === request.uuid
        ? { ...req, requestStatus: newStatus }
        : req)),
    }));
  }, []);

  return {
    isLoading,
    bnrRequests,
    requestsOverview: REQUEST_STATUS_FILTER_CHOICES,
    fetchBnrRequests: debouncedFetchBnrRequests,
    updateRequestStatus,
    refreshRequests,
  };
};

export default useBnrSubsidyRequests;
