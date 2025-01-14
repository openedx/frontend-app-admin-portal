import {
  useCallback, useMemo, useState,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';
import _ from 'lodash';

import LmsApiService from '../../../../data/services/LmsApiService';

const useEnterpriseMembersTableData = ({ enterpriseId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseMembersTableData, setEnterpriseMembersTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });

  const fetchAllEnterpriseMembersData = useCallback(async () => {
    const { options, itemCount } = enterpriseMembersTableData;
    // Take the existing filters but specify we're taking all results on one page
    const fetchAllOptions = { ...options, page: 1, page_size: itemCount };
    const response = await LmsApiService.fetchEnterpriseCustomerMembers(enterpriseId, fetchAllOptions);
    return camelCaseObject(response.data);
  }, [enterpriseId, enterpriseMembersTableData]);

  const fetchEnterpriseMembersData = useCallback((args) => {
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
        // if (args?.sortBy.length > 0) {
        //   const sortByValue = args.sortBy[0].id;
        //   options.sort_by = _.snakeCase(sortByValue);
        // if (!args.sortBy[0].desc) {
        //   options.is_reversed = !args.sortBy[0].desc;
        // }

        if (args?.sortBy.length > 0) {
          const sortByValue = args.sortBy[0].id;
          options.sort_by = _.snakeCase(sortByValue);
          if (!args.sortBy[0].desc) {
            options.is_reversed = !args.sortBy[0].desc;
          }
        }
        // }
        options.page = args.pageIndex + 1;
        const response = await LmsApiService.fetchEnterpriseCustomerMembers(enterpriseId, options);
        const data = camelCaseObject(response.data);
        setEnterpriseMembersTableData({
          itemCount: data.count,
          pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
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

  const debouncedFetchEnterpriseMembersData = useMemo(
    () => debounce(fetchEnterpriseMembersData, 300),
    [fetchEnterpriseMembersData],
  );

  return {
    isLoading,
    enterpriseMembersTableData,
    fetchEnterpriseMembersTableData: debouncedFetchEnterpriseMembersData,
    fetchAllEnterpriseMembersData,
  };
};

export default useEnterpriseMembersTableData;
