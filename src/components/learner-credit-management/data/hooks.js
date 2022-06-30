import {
  useCallback, useEffect, useState, useMemo, useRef,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import debounce from 'lodash.debounce';

import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import {
  transformOfferSummary,
  transformUtilizationTableResults,
} from './utils';
import { API_FIELDS_BY_TABLE_COLUMN_ACCESSOR } from './constants';

export const useOfferSummary = (enterpriseUUID, enterpriseOffer) => {
  const [isLoading, setIsLoading] = useState(true);
  const [offerSummary, setOfferSummary] = useState();

  useEffect(() => {
    if (!enterpriseOffer) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await EnterpriseDataApiService.fetchEnterpriseOfferSummary(
          enterpriseUUID, enterpriseOffer.id,
        );
        const data = camelCaseObject(response.data);
        const transformedOfferSummary = transformOfferSummary(data);
        setOfferSummary(transformedOfferSummary);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enterpriseUUID, enterpriseOffer]);

  return {
    isLoading,
    offerSummary,
  };
};

const applySortByToOptions = (sortBy, options) => {
  const orderingStrings = sortBy.map(({ id, desc }) => {
    const apiFieldForColumnAccessor = API_FIELDS_BY_TABLE_COLUMN_ACCESSOR[id];
    if (!apiFieldForColumnAccessor) {
      return id;
    }
    if (desc) {
      return `-${apiFieldForColumnAccessor}`;
    }
    return apiFieldForColumnAccessor;
  });
  Object.assign(options, {
    ordering: orderingStrings.join(','),
  });
};

const applyFiltersToOptions = (filters, options) => {
  const userSearchQuery = filters?.find(filter => filter.id === 'userEmail')?.value;
  const courseTitleSearchQuery = filters?.find(filter => filter.id === 'courseTitle')?.value;
  if (userSearchQuery) {
    Object.assign(options, { search: userSearchQuery });
  }
  if (courseTitleSearchQuery) {
    Object.assign(options, { searchCourse: courseTitleSearchQuery });
  }
};

export const useLearnerCreditAllocations = (enterpriseUUID, offerId) => {
  const shouldTrackFetchEvents = useRef(false);
  const [isLoadingTableData, setIsLoadingTableData] = useState(true);
  const [tableData, setTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  const fetchTableData = useCallback((args) => {
    const fetch = async () => {
      try {
        setIsLoadingTableData(true);
        const options = {
          page: args.pageIndex + 1, // `DataTable` uses zero-indexed array
          pageSize: args.pageSize,
          offerId,
          ignoreNullCourseListPrice: true,
        };
        if (args.sortBy?.length > 0) {
          applySortByToOptions(args.sortBy, options);
        }
        if (args.filters?.length > 0) {
          applyFiltersToOptions(args.filters, options);
        }
        const response = await EnterpriseDataApiService.fetchCourseEnrollments(
          enterpriseUUID,
          options,
        );
        const data = camelCaseObject(response.data);
        const transformedTableResults = transformUtilizationTableResults(data.results);
        setTableData({
          itemCount: data.count,
          pageCount: data.numPages,
          results: transformedTableResults,
        });
        if (shouldTrackFetchEvents.current) {
          // track event only after original API query to avoid sending event on initial page load. instead,
          // only track event when user performs manual data operation (e.g., pagination, sort, filter) and
          // send all table state as event properties.
          sendEnterpriseTrackEvent(
            enterpriseUUID,
            'edx.ui.enterprise.admin_portal.learner-credit-management.table.data.changed',
            options,
          );
        } else {
          // set to true to enable tracking events on future API queries
          shouldTrackFetchEvents.current = true;
        }
      } catch (error) {
        logError(error);
      } finally {
        setIsLoadingTableData(false);
      }
    };
    fetch();
  }, [enterpriseUUID, offerId, shouldTrackFetchEvents]);

  const debouncedFetchTableData = useMemo(() => debounce(fetchTableData, 300), [fetchTableData]);

  return {
    isLoading: isLoadingTableData,
    tableData,
    fetchTableData: debouncedFetchTableData,
  };
};
