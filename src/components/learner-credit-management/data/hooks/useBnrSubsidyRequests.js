import {
  useCallback, useMemo, useState, useRef,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { debounce } from 'lodash-es';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { REQUEST_TAB_VISIBLE_STATES } from '../constants';
import useBudgetId from './useBudgetId';
import { transformRequestOverview } from '../utils';
import { SUBSIDY_REQUEST_STATUS } from '../../../../data/constants/subsidyRequests';

const initialBnrRequestsState = {
  results: [],
  itemCount: 0,
  pageCount: 0,
  currentPage: 1,
  learnerRequestStateCounts: [],
};

// Map table column accessors to API field names for sorting
const API_FIELDS_BY_TABLE_COLUMN_ACCESSOR = {
  requestDetails: 'requestDetails',
  amount: 'course_price',
  requestDate: 'requestDate',
  requestStatus: 'requestStatus',
  learnerRequestState: 'learner_request_state',
  lastActionStatus: 'latest_action_status',
  recentAction: 'latest_action_time',
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

export const applyFiltersToOptions = (filters, options) => {
  if (!filters || filters.length === 0) {
    return;
  }
  const emailSearchQuery = filters.find(filter => filter.id === 'requestDetails')?.value;
  const statusFilter = filters.find(filter => filter.id === 'requestStatus')?.value;
  const learnerRequestStateFilter = filters.find(filter => filter.id === 'learnerRequestState')?.value;
  const lastActionStatusFilter = filters.find(filter => filter.id === 'lastActionStatus')?.value;

  if (emailSearchQuery) {
    Object.assign(options, {
      search: emailSearchQuery,
    });
  }

  if (statusFilter && statusFilter.length > 0) {
    Object.assign(options, {
      state: statusFilter.join(','),
    });
  }

  if (learnerRequestStateFilter && learnerRequestStateFilter.length > 0) {
    if (learnerRequestStateFilter.length === 1) {
      Object.assign(options, {
        learner_request_state: learnerRequestStateFilter[0],
      });
    } else {
      Object.assign(options, {
        learner_request_state__in: learnerRequestStateFilter.join(','),
      });
    }
  }

  if (lastActionStatusFilter && lastActionStatusFilter.length > 0) {
    if (lastActionStatusFilter.length === 1) {
      Object.assign(options, {
        latest_action_status: lastActionStatusFilter[0],
      });
    } else {
      Object.assign(options, {
        latest_action_status__in: lastActionStatusFilter.join(','),
      });
    }
  }
};

export const applyOverviewFiltersToOptions = (filters, options) => {
  if (!filters || filters.length === 0) {
    return;
  }
  const emailSearchQuery = filters.find(filter => filter.id === 'requestDetails')?.value;

  if (emailSearchQuery) {
    Object.assign(options, {
      search: emailSearchQuery,
    });
  }
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
    lastActionErrorReason: item?.latestAction?.errorReason,
    lastActionDate,
    latestAction: item?.latestAction,
    // Add learner request state from API (camelCase after transformation)
    learnerRequestState: item?.learnerRequestState,
  };
});

const useBnrSubsidyRequests = ({
  enterpriseId,
  isEnabled = true,
}) => {
  const currentArgsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bnrRequests, setBnrRequests] = useState(initialBnrRequestsState);
  const { subsidyAccessPolicyId } = useBudgetId();
  const [requestsOverview, setRequestsOverview] = useState([]);

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
        subsidyAccessPolicyId,
        options,
      );
      const data = camelCaseObject(response.data);
      const transformedResults = transformApiDataToTableData(data.results || []);

      const learnerRequestStateCounts = Object.entries(
        transformedResults.reduce((counts, request) => {
          const { learnerRequestState } = request;
          if (learnerRequestState) {
            // eslint-disable-next-line no-param-reassign
            counts[learnerRequestState] = (counts[learnerRequestState] || 0) + 1;
          }
          return counts;
        }, {}),
      ).map(([learnerRequestState, count]) => ({
        learnerRequestState,
        count,
      }));

      setBnrRequests({
        itemCount: data.count || 0,
        pageCount: data.numPages || Math.ceil((data.count || 0) / (options.page_size || 10)),
        results: transformedResults || [],
        currentPage: options.page,
        learnerRequestStateCounts,
      });
      setIsLoading(false);

      // Memoizes argsCopy to be referenced against future re-renders
      currentArgsRef.current = argsCopy;
    } catch (error) {
      logError('Failed to fetch BNR subsidy requests', error);
      setIsLoading(false);
    }
  }, [isEnabled, enterpriseId, subsidyAccessPolicyId]);

  const fetchBnrRequestsOverview = useCallback(async (filters = []) => {
    try {
      setIsLoading(true);
      const options = {};

      if (filters && filters.length > 0) {
        applyOverviewFiltersToOptions(filters, options);
      }

      const response = await EnterpriseAccessApiService.fetchBnrSubsidyRequestsOverview(
        enterpriseId,
        subsidyAccessPolicyId,
        options,
      );
      const data = camelCaseObject(response.data);
      const transformedOverview = transformRequestOverview(data);
      setRequestsOverview(transformedOverview);
    } catch (error) {
      logError('Failed to fetch BNR subsidy requests overview', error);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId, subsidyAccessPolicyId]);

  const fetchBnrRequestsAndOverview = useCallback(async (args) => {
    await fetchBnrRequests(args);

    const filters = args?.filters || [];
    await fetchBnrRequestsOverview(filters);
  }, [fetchBnrRequests, fetchBnrRequestsOverview]);

  const debouncedFetchBnrRequests = useMemo(
    () => debounce(fetchBnrRequestsAndOverview, 300),
    [fetchBnrRequestsAndOverview],
  );

  const refreshRequests = useCallback(() => {
    debouncedFetchBnrRequests(currentArgsRef.current);
  }, [debouncedFetchBnrRequests]);

  const updateRequestStatus = useCallback(({ request, newStatus }) => {
    setBnrRequests(prevState => ({
      ...prevState,
      results: prevState.results.map(req => (req.uuid === request.uuid
        ? { ...req, requestStatus: newStatus }
        : req)),
    }));
  }, []);

  const fetchApprovedRequests = useCallback(
    (passedArgs) => {
      const args = passedArgs || currentArgsRef.current || {};
      const filters = args.filters || [];
      // Add an approved status filter in the format expected by the hook
      const updatedFilters = [
        ...filters.filter((f) => f.id !== 'requestStatus'),
        { id: 'requestStatus', value: [SUBSIDY_REQUEST_STATUS.APPROVED] },
      ];
      return fetchBnrRequests({ ...args, filters: updatedFilters });
    },
    [fetchBnrRequests],
  );

  return {
    isLoading,
    bnrRequests,
    requestsOverview,
    fetchBnrRequests: debouncedFetchBnrRequests,
    updateRequestStatus,
    refreshRequests,
    fetchBnrRequestsOverview,
    fetchApprovedRequests,
  };
};

export default useBnrSubsidyRequests;
