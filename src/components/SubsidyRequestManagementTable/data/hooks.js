import { useCallback, useState, useEffect } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import { transformRequestOverview, transformRequests } from './utils';
import { useIsMounted } from '../../../hooks';
import DiscoveryApiService from '../../../data/services/DiscoveryApiService';

export const DEBOUNCE_TIME_MS = 200;
export const PAGE_SIZE = 20;

export const useSubsidyRequests = (
  enterpriseId,
  overviewServiceFn,
  requestsServiceFn,
) => {
  const isMounted = useIsMounted();
  const [searchOptions, setSearchOptions] = useState({
    query: '',
    page: 1,
    filters: {
      requestStatus: [],
    },
  });
  const debouncedSetSearchOptions = debounce(setSearchOptions, DEBOUNCE_TIME_MS);
  const [requests, setRequests] = useState({
    requests: [],
    pageCount: 0,
    itemCount: 0,
  });
  const [requestsOverview, setRequestsOverview] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingRequestsOverview, setIsLoadingRequestsOverview] = useState(false);

  const isLoading = isLoadingRequests || isLoadingRequestsOverview;

  /**
   * Fetches counts of each request status.
   */
  const fetchOverview = async () => {
    setIsLoadingRequestsOverview(true);
    try {
      const options = {};
      if (searchOptions.query) {
        options.search = searchOptions.query;
      }
      const response = await overviewServiceFn(
        enterpriseId,
        options,
      );
      const data = camelCaseObject(response.data);
      const result = transformRequestOverview(data);
      setRequestsOverview(result);
    } catch (err) {
      logError(err);
    } finally {
      setIsLoadingRequestsOverview(false);
    }
  };

  /**
   * Fetches license requests from the API.
   */
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const options = {
        page: searchOptions.page,
        page_size: PAGE_SIZE,
      };
      if (searchOptions.query) {
        options.search = searchOptions.query;
      }
      const response = await requestsServiceFn(
        enterpriseId,
        searchOptions.filters?.requestStatus,
        options,
      );
      const data = camelCaseObject(response.data);
      const transformedRequests = transformRequests(data.results);
      setRequests({
        requests: transformedRequests,
        pageCount: data.numPages,
        itemCount: data.count,
      });
    } catch (err) {
      logError(err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  /**
   * Fetches counts of each license request state for use in the table filters
   * on initial component mount.
   */
  useEffect(() => {
    if (!isMounted) { return; }
    fetchOverview();
    fetchRequests();
  }, [isMounted, searchOptions]);

  /**
   * Handles table pagination/filter/sort changes.
   *
   * @param {Object} args See Paragon documentation on the args passed to the
   * callback fn of `fetchData`.
   */
  const handleFetchRequests = useCallback(
    (args) => {
      const requestStatusFilters = args.filters.find(filter => filter.id === 'requestStatus')?.value;
      const page = args.pageIndex + 1;
      const query = args.filters.find(filter => filter.id === 'email')?.value || '';
      debouncedSetSearchOptions({
        page,
        query,
        filters: {
          requestStatus: requestStatusFilters,
        },
      });
    },
    [],
  );

  return {
    handleFetchRequests,
    requests,
    requestsOverview,
    isLoading,
  };
};

// ===

export const useCourseDetails = (courseKey) => {
  const [courseDetails, setCourseDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    () => {
      const getCourseDetails = async () => {
        setIsLoading(true);
        try {
          const response = await DiscoveryApiService.fetchCourseDetails(courseKey);
          const result = camelCaseObject(response.data);
          setCourseDetails(result);
        } catch (err) {
          logError(err);
        } finally {
          setIsLoading(false);
        }
      };
      getCourseDetails();
    },
    [courseKey],
  );

  return [courseDetails, isLoading];
};
