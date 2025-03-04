import { useMemo, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { v4 as uuidv4 } from 'uuid';
import snakeCase from 'lodash/snakeCase';
import { useLocation, useNavigate } from 'react-router-dom';
import isArray from 'lodash/isArray';
import { isObject } from 'lodash';

// We should attempt to include sane defaults for null values
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_INDEX = 0;
const shortIdentifier = uuidv4().slice(0, 8);

// Handle filter and sorting
const handleFilters = (id, filters, customFilters = {}) => {
  const filterObj = {};
  // custom filter from external search input
  for (const key in customFilters) {
    if (customFilters[key]) {
      filterObj[`${id}_${snakeCase(key)}`] = customFilters[key];
    }
  }

  // default filter
  filters.forEach((filter) => {
    filterObj[`${id}${filter}`] = snakeCase(filter);
  });
  return filterObj;
};

const handleSortBy = (id, sortBy) => {
  const sortByObj = { };
  sortBy.forEach((sortByItem) => {
    sortByObj[`${id}_ordering`] = sortByItem.desc ? `-${snakeCase(sortByItem.id)}` : `${snakeCase(sortByItem.id)}`;
  });
  return sortByObj;
};

// A wrapper to the fetchData call to include any necessary calls required for any datatable
const fetchDataWrapper = async (args) => {
  try {
    const sortByObj = handleSortBy(args.dataTableId, args.sortBy);
    const filtersObj = handleFilters(args.dataTableId, args.filters, args.customFilters);
    const newSearchParams = { ...filtersObj, ...sortByObj };
    const updatedArgs = { ...args, searchParams: newSearchParams };
    const resolvedData = await args.fetchData(updatedArgs);
    return resolvedData;
  } catch (error) {
    logError(error);
  }
};

const useDatatable = (args) => {
  const [data, setData] = useState([]);
  const [originalResponse, setOriginalResponse] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Instantiate with values from args or sane defaults
  const datatableProps = useMemo(() => ({
    id: args.tableId || shortIdentifier,
    initialState: args.initialState || {},
    itemCount: args.itemCount || 0,
    pageCount: args.pageCount || 1,
    columns: args.columns || [],
    fetchData: args.fetchData || null,
    data: args.data || [],
    isPaginated: args.isPaginated || false,
    isSortable: args.isSortable || false,
    isFilterable: args.isFilterable || false,
  }), [args]);
  const initialState = {
    pageSize: args.initialState.pageSize || DEFAULT_PAGE_SIZE,
    pageIndex: args.initialState.pageIndex || DEFAULT_PAGE_INDEX,
    filters: args.initialState.filters || [],
    sortBy: args.initialState.sortBy || [],
  };

  // Initial State
  datatableProps.initialState = args.initialState;
  //  columns
  datatableProps.columns = args.columns || [];

  // manual pagination
  if (args.manualPagination) {
    datatableProps.manualPagination = true;
    datatableProps.isPaginated = true;
    datatableProps.initialState.pageSize = initialState.pageSize;
    datatableProps.initialState.pageIndex = initialState.pageIndex;
  }
  // manual sort
  if (args.manualSortBy) {
    datatableProps.manualSortBy = true;
    datatableProps.isSortable = true;
  }

  // manual filters
  if (args.manualFilters) {
    datatableProps.manualFilters = true;
    datatableProps.isFilterable = true;
  }

  // Datatable data and fetch data
  if (args.fetchData) {
    datatableProps.fetchData = async (fetchDataArgs) => {
      try {
        const response = await fetchDataWrapper({
          ...fetchDataArgs,
          fetchData: args.fetchData,
          dataTableId: datatableProps.id,
          customFilters: args.customFilters || {},
          navigate,
          location,
        });
        if (response) {
          // TODO: Update conditionals
          if (isArray(response) && data.length === 0) {
            setData(response);
          } else if (isObject(response) && originalResponse === null) {
            setOriginalResponse(response);
            const resultsData = args.dataAccessor ? response[args.dataAccessor] : response;
            setData(resultsData);
          }
          return response;
        }
        return [];
      } catch (error) {
        logError(error);
      }
      return [];
    };
    // Data attribute
    datatableProps.data = data[args.dataAccessor] || data || args.data || [];

    // item and page count
    if (datatableProps.isPaginated && originalResponse) {
      if (originalResponse.count) {
        datatableProps.itemCount = originalResponse.count;
      }
      if (originalResponse.numPages) {
        datatableProps.pageCount = originalResponse.numPages;
      } else if (datatableProps.itemCount) {
        datatableProps.pageCount = Math.ceil(datatableProps.itemCount / datatableProps.data.length);
      }
    }
  }
  return useMemo(() => datatableProps, [datatableProps]);
};

export default useDatatable;
