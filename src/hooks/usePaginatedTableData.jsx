import {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import debounce from 'lodash.debounce';
import { logError } from '@edx/frontend-platform/logging';
import { applySortByToOptions, trackDataTableEvent } from '../utils';
import EVENT_NAMES from '../eventTracking';

/**
   * A reusable React hook for fetching paginated, sortable table data from an API.
   *
   * @param {Object} params
   * @param {string} params.enterpriseId - The enterprise identifier used for the API call.
   * @param {string} params.tableId - An ID used for event tracking and error context.
   * @param {Object} params.apiFieldsForColumnAccessor - Mapping of column IDs to API field keys.
   * @param {Function} params.fetchFunction - A function to fetch the data. Must return a promise
   * resolving to an object with `.data`.
   *
   * @returns {{
   *   isLoading: boolean,
   *   data: {
   *     itemCount: number,
   *     pageCount: number,
   *     results: Array<any>,
   *   },
   *   fetchData: Function,
   *   hasData: boolean,
   * }}
   */
const usePaginatedTableData = ({
  enterpriseId,
  tableId,
  apiFieldsForColumnAccessor,
  fetchFunction,
  fetchFunctionOptions,
}) => {
  const shouldTrackFetchEvents = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  /**
     * Fetches paginated data using the provided fetchFunction.
     */
  const fetchData = useCallback(async (args) => {
    try {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1,
        pageSize: args.pageSize,
      };
      applySortByToOptions(args.sortBy, apiFieldsForColumnAccessor, options);

      const response = await fetchFunction(enterpriseId, {
        ...fetchFunctionOptions,
        ...options,
      });
      const data = camelCaseObject(response.data);

      setTableData({
        itemCount: data.count,
        pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
        results: data.results,
      });

      trackDataTableEvent({
        shouldTrackRef: shouldTrackFetchEvents,
        enterpriseId,
        eventName: EVENT_NAMES.PROGRESS_REPORT.DATATABLE_SORT_BY_OR_FILTER,
        tableId,
        options,
      });
    } catch (error) {
      logError(error, {
        tableState: {
          tableId,
          enterpriseId,
          filters: args.filters || 'none',
          sortBy: JSON.stringify(args.sortBy || []),
        },
        message: `Error fetching data for table ${tableId}`,
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseId, tableId, apiFieldsForColumnAccessor, fetchFunction]);

  const debouncedFetchData = useMemo(() => debounce(fetchData, 300), [fetchData]);

  const hasData = useMemo(() => tableData.results.length > 0, [tableData.results]);

  return {
    isLoading,
    data: tableData,
    fetchData: debouncedFetchData,
    fetchDataImmediate: fetchData,
    hasData,
  };
};

export default usePaginatedTableData;
