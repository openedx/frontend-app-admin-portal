import {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import debounce from 'lodash.debounce';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import EVENT_NAMES from '../../../../eventTracking';

const applySortByToOptions = (sortBy, options, apiFieldsForColumnAccessor) => {
  if (!sortBy || sortBy.length === 0) {
    return;
  }
  const orderingStrings = sortBy.map(({ id, desc }) => {
    const apiFieldForColumnAccessor = apiFieldsForColumnAccessor[id];
    if (!apiFieldForColumnAccessor) {
      return undefined;
    }
    const apiFieldKey = apiFieldForColumnAccessor.key;
    return desc ? `-${apiFieldKey}` : apiFieldKey;
  }).filter(orderingString => !!orderingString);

  Object.assign(options, {
    ordering: orderingStrings.join(','),
  });
};

const useGenericTableData = (enterpriseId, tableId, fetchMethod, apiFields) => {
  const shouldTrackFetchEvents = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  const fetchTableData = useCallback(async (args) => {
    try {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1,
        pageSize: args.pageSize,
      };
      applySortByToOptions(args.sortBy, options, apiFields);

      const response = await fetchMethod(enterpriseId, options);
      const data = camelCaseObject(response.data);

      setTableData({
        itemCount: data.count,
        pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
        results: data.results,
      });

      if (shouldTrackFetchEvents.current) {
        sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.PROGRESS_REPORT.DATATABLE_SORT_BY_OR_FILTER,
          {
            tableId,
            ...options,
          },
        );
      } else {
        shouldTrackFetchEvents.current = true;
      }
    } catch (error) {
      logError(error);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId, tableId, fetchMethod, apiFields]);

  const debouncedFetchTableData = useMemo(
    () => debounce(fetchTableData, 300),
    [fetchTableData],
  );

  return {
    isLoading,
    tableData,
    fetchTableData: debouncedFetchTableData,
  };
};

export default useGenericTableData;
