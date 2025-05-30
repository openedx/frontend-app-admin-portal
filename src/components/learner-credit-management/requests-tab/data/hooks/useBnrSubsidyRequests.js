import {
  useCallback, useMemo, useState,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import debounce from 'lodash.debounce';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';

// Map table column accessors to API field names for sorting
const API_FIELDS_BY_TABLE_COLUMN_ACCESSOR = {
  requestDetails: 'email',
  amount: 'course_list_price',
  requestDate: 'created',
  requestStatus: 'state',
};

// Hardcoded filter choices for request status
const HARDCODED_REQUEST_STATUS_FILTER_CHOICES = [
  {
    name: 'Requested',
    value: 'requested',
    number: 0,
  },
  {
    name: 'Approved',
    value: 'approved',
    number: 0,
  },
  {
    name: 'Declined',
    value: 'declined',
    number: 0,
  },
];

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
  const requestDetailsSearchQuery = filters?.find(filter => filter.id === 'email')?.value;
  const statusFilter = filters?.find(filter => filter.id === 'requestStatus')?.value;

  if (requestDetailsSearchQuery) {
    Object.assign(options, {
      search: requestDetailsSearchQuery,
    });
  }

  if (statusFilter && statusFilter.length > 0) {
    Object.assign(options, {
      state: statusFilter.join(','),
    });
  }
};

// Transform API response data to match DataTable requirements
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
    amount: 500,
    requestDate,
    requestStatus: item?.state,
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

  const fetchBnrRequests = useCallback((args = {}) => {
    const fetch = async () => {
      try {
        setIsLoading(true);

        const options = {
          page: (args.pageIndex || 0) + 1, // DataTable uses zero-indexed array
          page_size: args.pageSize || 20,
        };

        // Apply sorting if provided
        if (args.sortBy && args.sortBy.length > 0) {
          applySortByToOptions(args.sortBy, options);
        }

        // Apply filters if provided
        if (args.filters && args.filters.length > 0) {
          applyFiltersToOptions(args.filters, options);
        }
        // Fetch the requests data
        const response = await EnterpriseAccessApiService.fetchBnrSubsidyRequests(
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enterpriseUUID,
  ]);

  const debouncedFetchBnrRequests = useMemo(
    () => debounce(fetchBnrRequests, 300),
    [fetchBnrRequests],
  );

  const updateRequestStatus = useCallback(({ request, newStatus }) => {
    setBnrRequests(prevState => ({
      ...prevState,
      results: prevState.results.map(req => (req.uuid === request.uuid
        ? { ...req, requestStatus: newStatus }
        : req)),
    }));
  }, []);

  const refreshRequests = useCallback(() => {
    fetchBnrRequests();
  }, [fetchBnrRequests]);
  return {
    isLoading,
    bnrRequests,
    requestsOverview: HARDCODED_REQUEST_STATUS_FILTER_CHOICES,
    fetchBnrRequests: debouncedFetchBnrRequests,
    updateRequestStatus,
    refreshRequests,
  };
};

export default useBnrSubsidyRequests;
