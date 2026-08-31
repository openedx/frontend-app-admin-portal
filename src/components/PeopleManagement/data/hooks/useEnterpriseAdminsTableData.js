import { useCallback, useMemo, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { debounce, snakeCase } from 'lodash-es';
import LmsApiService from '../../../../data/services/LmsApiService';

const useEnterpriseAdminsTableData = ({ enterpriseId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseAdminsTableData, setEnterpriseAdminsTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });
  /** Download records */
  // const fetchAllEnterpriseAdminsData = useCallback(async () => {
  //   const { options, itemCount } = enterpriseAdminsTableData;
  //   // Take the existing filters but specify we're taking all results on one page
  //   const fetchAllOptions = { ...options, page: 1, page_size: itemCount };
  //   const response = await LmsApiService.fetchEnterpriseCustomerMembers(enterpriseId, fetchAllOptions);
  //   return camelCaseObject(response.data);
  // }, [enterpriseId, enterpriseAdminsTableData]);

  const fetchEnterpriseAdminsData = useCallback((args) => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const options = {};
        args.filters.forEach((filter) => {
          const { id, value } = filter;
          if (id === 'name') {
            options.user_query = value;
          }
        });
        if (args?.sortBy.length > 0) {
          const sortByValue = args.sortBy[0].id;
          options.sort_by = snakeCase(sortByValue);
          if (!args.sortBy[0].desc) {
            options.is_reversed = !args.sortBy[0].desc;
          }
        }
        options.page = args.pageIndex + 1;
        const response = await LmsApiService.fetchEnterpriseAdminMembers(enterpriseId, options);
        const data = camelCaseObject(response.data);
        setEnterpriseAdminsTableData({
          itemCount: data.count,
          pageCount: data.numPages ?? Math.ceil(data.count / options.pageSize),
          results: data.results,
          options,
        });
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (args.filters.length && args.filters[0].value.length > 2) {
      fetch();
    } else if (!args.filters.length) {
      fetch();
    }
  }, [enterpriseId]);

  const debouncedFetchEnterpriseAdminsData = useMemo(
    () => debounce(fetchEnterpriseAdminsData, 300),
    [fetchEnterpriseAdminsData],
  );

  return {
    isLoading,
    enterpriseAdminsTableData,
    fetchEnterpriseAdminsTableData: debouncedFetchEnterpriseAdminsData,
    // fetchAllEnterpriseAdminsData,
  };
};

export default useEnterpriseAdminsTableData;
