import { useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_INDEX = 0;

const doFancyStuffLikeTrackAndUrlsWithoutFetchData = async (arggs) => {
  try {
    const resolvedData = await arggs.fetchData(arggs);
    // Send track events
    return resolvedData;
  } catch (error) {
    console.log(error, 'error');
  }
};

const useDatatable = (args) => {
  const [data, setData] = useState([]);
  const datatableProps = useMemo(() => ({
    initialState: {} || args.initialState,
    columns: [] || args.columns,
    fetchData: null || args.fetchData,
    data: [] || args.data,
    isPaginated: false || args.isPaginated,
    manualPagination: false || args.manualPagination,
    isSortable: false || args.isSortable,
    manualSortBy: false || args.manualSortBy,
    isFilterable: false || args.isFilterable,
    manualFilters: false || args.manualFilters,
  }), [args]);
  const initialState = {
    pageSize: null,
    pageIndex: null,
    filters: null,
    sortBy: null,
  };
  // if (args.data && !args.fetchData) {
  //   const fetchDataInfo = (argss) => {
  //     console.log(argss, 'invisible fetchData');
  //     // Track events
  //     // Update URL query parameters
  //     return argss;
  //   };
  //   datatableProps.fetchData = fetchDataInfo;
  //   datatableProps.data = args.data;
  // }

  // Initial State
  datatableProps.initialState = args.initialState;
  //  columns
  datatableProps.columns = args.columns || [];

  // manual pagination
  if (args.manualPagination) {
    datatableProps.manualPagination = true;
    datatableProps.isPaginated = true;
    datatableProps.initialState.pageSize = args.initialState.pageSize || DEFAULT_PAGE_SIZE;
    datatableProps.initialState.pageIndex = args.initialState.pageSize || DEFAULT_PAGE_INDEX;
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
    datatableProps.fetchData = async (arggs) => {
      try {
        const results = await doFancyStuffLikeTrackAndUrlsWithoutFetchData({ ...arggs, fetchData: args.fetchData });
        if (results) {
          if (data.length === 0) {
            setData({ ...results, datasetArgs: arggs });
          }
          return results;
        }
        return [];
      } catch (error) {
        console.log(error, 'error');
      }
      return [];
    };
    // Data attribute
    datatableProps.data = data[args.dataAccessor] || data || [];

    // item and page count
    if (data.count) {
      datatableProps.itemCount = data.count;
    }
    if (data.numPages) {
      datatableProps.pageCount = data.numPages;
    } else if (datatableProps.itemCount) {
      datatableProps.pageCount = Math.ceil(datatableProps.itemCount / datatableProps.data.length);
    }
  }

  console.log(datatableProps, 'datatableProps');
  return useMemo(() => datatableProps, [datatableProps]);
};

export default useDatatable;
