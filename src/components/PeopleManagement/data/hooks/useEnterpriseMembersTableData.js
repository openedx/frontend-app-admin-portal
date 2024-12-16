import {
  useCallback, useMemo, useState,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import LmsApiService from '../../../../data/services/LmsApiService';

const useEnterpriseMembersTableData = ({ enterpriseId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseMembersTableData, setEnterpriseMembersTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });
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

        options.page = args.pageIndex + 1;
        const response = await LmsApiService.fetchEnterpriseCustomerMembers(enterpriseId, options);
        const data = camelCaseObject(response.data);
        setEnterpriseMembersTableData({
          itemCount: data.count,
          pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
          results: data.results,
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
  };
};

export default useEnterpriseMembersTableData;
