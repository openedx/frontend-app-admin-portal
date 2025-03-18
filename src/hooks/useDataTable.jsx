import {
  useCallback, useMemo, useState, useRef, useEffect,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import debounce from 'lodash.debounce';
import { logError } from '@edx/frontend-platform/logging';

/**
   * Generic hook for data tables with pagination and sorting
   *
   * @param {Function} fetchDataFn - Function to fetch data (receives options and returns Promise)
   * @param {Object} fieldMappings - Map of column IDs to API field names
   * @param {Object} options - Additional options like debounce time
   * @returns {Object} Table data and handlers for a React Table
   */
const useDataTable = (
  fetchDataFn,
  fieldMappings = {},
  options = {},
) => {
  // Use default options with proper dependency handling
  const defaultOptions = useMemo(() => ({
    debounceTime: 300,
    ...options,
  }), [options]);

  // Store stable references to dependencies
  const fetchDataFnRef = useRef(fetchDataFn);
  const fieldMappingsRef = useRef(fieldMappings);

  // Update refs when dependencies change
  useEffect(() => {
    fetchDataFnRef.current = fetchDataFn;
    fieldMappingsRef.current = fieldMappings;
  }, [fetchDataFn, fieldMappings]);

  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  const applySortByToOptions = useCallback((sortBy, queryOptions) => {
    if (!sortBy || sortBy.length === 0) {
      return;
    }

    const orderingStrings = sortBy.map(({ id, desc }) => {
      const fieldMapping = fieldMappingsRef.current[id];
      if (!fieldMapping) {
        return undefined;
      }
      const apiFieldKey = fieldMapping.key;
      return desc ? `-${apiFieldKey}` : apiFieldKey;
    }).filter(Boolean);

    if (orderingStrings.length > 0) {
      Object.assign(queryOptions, {
        ordering: orderingStrings.join(','),
      });
    }
  }, []);

  const fetchData = useCallback(async (args) => {
    try {
      setIsLoading(true);
      const queryOptions = {
        page: args.pageIndex + 1,
        pageSize: args.pageSize,
      };

      // Apply sorting
      applySortByToOptions(args.sortBy, queryOptions);

      // Apply filters if they exist
      if (args.filters) {
        args.filters.forEach(filter => {
          const fieldMapping = fieldMappingsRef.current[filter.id];
          if (fieldMapping && filter.value) {
            queryOptions[fieldMapping.filterKey || fieldMapping.key] = filter.value;
          }
        });
      }

      // Use the ref to ensure stable reference
      const response = await fetchDataFnRef.current(queryOptions);
      const data = camelCaseObject(response.data);
      setTableData({
        itemCount: data.count,
        pageCount: data.numPages ?? Math.ceil(data.count / queryOptions.pageSize),
        results: data.results,
      });
    } catch (error) {
      logError(error);
    } finally {
      setIsLoading(false);
    }
  }, [applySortByToOptions]);

  // Create debounced fetch function with stabilized dependencies
  const debouncedFetchData = useMemo(
    () => debounce(fetchData, defaultOptions.debounceTime),
    [fetchData, defaultOptions.debounceTime],
  );

  // Clean up debounce on unmount
  useEffect(() => () => {
    debouncedFetchData.cancel();
  }, [debouncedFetchData]);

  return {
    isLoading,
    tableData,
    fetchData: debouncedFetchData,
  };
};

export default useDataTable;
