import { useCallback, useState, useEffect } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import { transformRequestOverview, transformRequests } from './utils';
import DiscoveryApiService from '../../../data/services/DiscoveryApiService';

export const DEBOUNCE_TIME_MS = 200;
export const PAGE_SIZE = 20;

export const useSubsidyRequests = (
  enterpriseId,
  overviewServiceFn,
  requestsServiceFn,
) => {
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
  const fetchOverview = async ({ query }) => {
    setIsLoadingRequestsOverview(true);
    try {
      const options = {};
      if (query) {
        options.search = query;
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
   * Fetches requests from the API.
   */
  const fetchRequests = async ({ page, query, filters }) => {
    setIsLoadingRequests(true);
    try {
      const options = {
        page,
        page_size: PAGE_SIZE,
      };
      if (query) {
        options.search = query;
      }
      const response = await requestsServiceFn(
        enterpriseId,
        filters?.requestStatus,
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

  const fetchData = useCallback(
    ({ page, query, filters }) => {
      fetchOverview({ query });
      fetchRequests({ page, query, filters });
    },
    [],
  );
  const debouncedFetchData = debounce(fetchData, DEBOUNCE_TIME_MS);

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
      debouncedFetchData({
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
