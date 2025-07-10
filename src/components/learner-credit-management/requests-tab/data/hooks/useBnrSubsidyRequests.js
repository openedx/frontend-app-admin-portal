import {
  useCallback, useMemo, useState, useRef,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { debounce } from 'lodash-es';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import { REQUEST_STATUS_FILTER_CHOICES, REQUEST_TAB_VISIBLE_STATES } from '../constants';

// Map table column accessors to API field names for sorting
const API_FIELDS_BY_TABLE_COLUMN_ACCESSOR = {
  requestDetails: 'requestDetails',
  amount: 'amount',
  requestDate: 'requestDate',
  requestStatus: 'requestStatus',
};

const applySortByToOptions = (sortBy, options) => {
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

const applyFiltersToOptions = (filters, options) => {
  const emailSearchQuery = filters?.find(filter => filter.id === 'requestDetails')?.value;
  const statusFilter = filters?.find(filter => filter.id === 'requestStatus')?.value;

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
};

// Transform API response data to match DataTable the requirements
const transformApiDataToTableData = (apiResults) => apiResults.map((item) => {
  const requestDate = new Date(item.created).toLocaleDateString('en-US', {
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
    latestAction: item?.latestAction,
  };
});

const useBnrSubsidyRequests = (
  enterpriseUUID,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [bnrRequests, setBnrRequests] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  // Use useRef to store current args without causing re-renders
  const currentArgsRef = useRef({});

  const fetchBnrRequests = useCallback((args = {}) => {
    // Store current args in ref
    currentArgsRef.current = args;

    const fetch = async () => {
      try {
        setIsLoading(true);

        const options = {
          page: (args.pageIndex || 0) + 1,
          page_size: args.pageSize || 10,
          state: REQUEST_TAB_VISIBLE_STATES.join(','),
        };

        if (args.sortBy && args.sortBy.length > 0) {
          applySortByToOptions(args.sortBy, options);
        }

        if (args.filters && args.filters.length > 0) {
          applyFiltersToOptions(args.filters, options);
        }

        const response = await EnterpriseAccessApiService.fetchBnrSubsidyRequests(
          enterpriseUUID,
          options,
        );
        const data = camelCaseObject(response.data);
        const transformedResults = transformApiDataToTableData(data.results || []);

        setBnrRequests({
          itemCount: data.count || 0,
          pageCount: data.numPages || Math.ceil((data.count || 0) / options.page_size),
          results: transformedResults || [],
        });
      } catch (error) {
        logError('Failed to fetch BNR subsidy requests', error);
        setBnrRequests({
          itemCount: 0,
          pageCount: 0,
          results: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [enterpriseUUID]);

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
