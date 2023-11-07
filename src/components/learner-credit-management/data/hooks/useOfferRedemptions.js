import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import debounce from 'lodash.debounce';

import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import SubsidyApiService from '../../../../data/services/EnterpriseSubsidyApiService';
import { API_FIELDS_BY_TABLE_COLUMN_ACCESSOR } from '../constants';
import { transformUtilizationTableResults, transformUtilizationTableSubsidyTransactionResults } from '../utils';
import useSubsidyAccessPolicy from './useSubsidyAccessPolicy';

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

const applyFiltersToOptions = (filters, options, shouldFetchSubsidyTransactions = false) => {
  const courseProductLineSearchQuery = filters?.find(filter => filter.id === 'courseProductLine')?.value;
  const searchQuery = filters?.find(filter => filter.id === 'enrollmentDetails')?.value;

  if (courseProductLineSearchQuery) {
    Object.assign(options, { courseProductLine: courseProductLineSearchQuery });
  }
  if (searchQuery) {
    const searchParams = {};
    searchParams[shouldFetchSubsidyTransactions ? 'search' : 'searchAll'] = searchQuery;
    Object.assign(options, searchParams);
  }
};

const useOfferRedemptions = (
  enterpriseUUID,
  offerId = null,
  budgetId = null,
  shouldFetchSubsidyTransactions = false,
) => {
  const shouldTrackFetchEvents = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerRedemptions, setOfferRedemptions] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(budgetId);

  const fetchOfferRedemptions = useCallback((args) => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const options = {
          page: args.pageIndex + 1, // `DataTable` uses zero-indexed array
          pageSize: args.pageSize,
          ignoreNullCourseListPrice: true,
        };
        if (budgetId !== null) {
          options.budgetId = budgetId;
        }
        if (offerId !== null) {
          options.offerId = offerId;
        }
        if (args.sortBy?.length > 0) {
          applySortByToOptions(args.sortBy, options);
        }
        if (args.filters?.length > 0) {
          applyFiltersToOptions(args.filters, options, shouldFetchSubsidyTransactions);
        }
        let data;
        let transformedTableResults;
        if (budgetId && shouldFetchSubsidyTransactions) {
          const response = await SubsidyApiService.fetchCustomerTransactions(
            subsidyAccessPolicy?.subsidyUuid,
            options,
          );
          data = camelCaseObject(response.data);
          transformedTableResults = transformUtilizationTableSubsidyTransactionResults(data.results);
        } else {
          const response = await EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseUUID,
            options,
          );
          data = camelCaseObject(response.data);
          transformedTableResults = transformUtilizationTableResults(data.results);
        }

        setOfferRedemptions({
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
        setIsLoading(false);
      }
    };
    if (offerId || budgetId) {
      fetch();
    }
  }, [
    enterpriseUUID,
    offerId,
    budgetId,
    shouldTrackFetchEvents,
    shouldFetchSubsidyTransactions,
    subsidyAccessPolicy?.subsidyUuid,
  ]);

  const debouncedFetchOfferRedemptions = useMemo(() => debounce(fetchOfferRedemptions, 300), [fetchOfferRedemptions]);

  return {
    isLoading,
    offerRedemptions,
    fetchOfferRedemptions: debouncedFetchOfferRedemptions,
  };
};

export default useOfferRedemptions;
