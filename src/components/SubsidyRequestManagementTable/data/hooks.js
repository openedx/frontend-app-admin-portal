import {
  useCallback, useState, useEffect, useReducer,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import {
  DEBOUNCE_TIME_MS,
  PAGE_SIZE,
  SUBSIDY_REQUESTS_TYPES,
} from './constants';
import { transformRequestOverview, transformRequests } from './utils';
import DiscoveryApiService from '../../../data/services/DiscoveryApiService';
import { initialSubsidyRequestsState, subsidyRequestsReducer } from './reducer';
import {
  setIsLoadingSubsidyRequests,
  setSubsidyRequestsData,
  setSubsidyRequestsOverviewData,
  updateSubsidyRequestStatus,

} from './actions';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

export const useSubsidyRequests = (
  enterpriseId,
  subsidyRequestType,
) => {
  if (!Object.values(SUPPORTED_SUBSIDY_TYPES).includes(subsidyRequestType)) {
    logError(`useSubsidyRequests does not support a subsidy request type of ${subsidyRequestType}.`);
  }
  const [subsidyRequestsState, dispatch] = useReducer(subsidyRequestsReducer, initialSubsidyRequestsState);
  const {
    requestsData, overviewData, isLoading,
  } = subsidyRequestsState;

  /**
   * Fetches counts of each request status.
   */
  const fetchOverview = useCallback(async ({ query }) => {
    dispatch(setIsLoadingSubsidyRequests(true));
    try {
      const options = {};
      if (query) {
        options.search = query;
      }
      const response = await SUBSIDY_REQUESTS_TYPES[subsidyRequestType].overview(
        enterpriseId,
        options,
      );
      const data = camelCaseObject(response.data);
      const result = transformRequestOverview(data);
      dispatch(setSubsidyRequestsOverviewData(result));
    } catch (err) {
      logError(err);
    } finally {
      dispatch(setIsLoadingSubsidyRequests(false));
    }
  }, [enterpriseId, subsidyRequestType]);

  /**
   * Fetches requests from the API.
   */
  const fetchRequests = useCallback(async ({ page, query, filters }) => {
    dispatch(setIsLoadingSubsidyRequests(true));
    try {
      const options = {
        page,
        page_size: PAGE_SIZE,
      };
      if (query) {
        options.search = query;
      }
      const response = await SUBSIDY_REQUESTS_TYPES[subsidyRequestType].requests(
        enterpriseId,
        filters?.requestStatus,
        options,
      );
      const data = camelCaseObject(response.data);
      const transformedRequests = transformRequests(data.results);
      dispatch(setSubsidyRequestsData({
        requests: transformedRequests,
        pageCount: data.numPages,
        itemCount: data.count,
      }));
    } catch (err) {
      logError(err);
    } finally {
      dispatch(setIsLoadingSubsidyRequests(false));
    }
  }, [enterpriseId, subsidyRequestType]);

  const fetchData = useCallback(
    ({ page, query, filters }) => {
      fetchOverview({ query });
      fetchRequests({ page, query, filters });
    },
    [fetchOverview, fetchRequests],
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
    [debouncedFetchData],
  );

  const updateRequestStatus = useCallback(({
    request,
    newStatus,
  }) => dispatch(updateSubsidyRequestStatus({
    request,
    newStatus,
  })), []);

  return {
    handleFetchRequests,
    updateRequestStatus,
    requests: requestsData,
    requestsOverview: overviewData,
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
