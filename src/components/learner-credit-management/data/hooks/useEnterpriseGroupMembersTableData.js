import { useCallback, useMemo, useState } from 'react';
import { debounce, snakeCase } from 'lodash-es';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { transformGroupMembersTableResults } from '../utils';

const useEnterpriseGroupMembersTableData = ({ policyUuid, groupId, refresh }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseGroupMembersTableData, setEnterpriseGroupMembersTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });
  const fetchEnterpriseGroupMembersData = useCallback((args) => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const options = { group_uuid: groupId };
        if (args?.sortBy.length > 0) {
          const sortByValue = args.sortBy[0].id;
          options.sort_by = snakeCase(sortByValue);
          if (!args.sortBy[0].desc) {
            options.is_reversed = !args.sortBy[0].desc;
          }
        }
        args.filters.forEach((filter) => {
          const { id, value } = filter;
          if (id === 'status') {
            options.show_removed = value;
          } else if (id === 'memberDetails') {
            options.user_query = value;
          }
        });

        options.page = args.pageIndex + 1;
        const response = await EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData(policyUuid, options);
        const data = camelCaseObject(response.data);
        const transformedTableResults = transformGroupMembersTableResults(data.results);

        setEnterpriseGroupMembersTableData({
          itemCount: data.count,
          pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
          results: transformedTableResults,
        });
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (policyUuid) {
      fetch();
    }
  }, [groupId, policyUuid]);

  const debouncedFetchEnterpriseGroupMembersData = useMemo(
    () => debounce(fetchEnterpriseGroupMembersData, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchEnterpriseGroupMembersData, refresh],
  );

  return {
    isLoading,
    enterpriseGroupMembersTableData,
    fetchEnterpriseGroupMembersTableData: debouncedFetchEnterpriseGroupMembersData,
  };
};

export default useEnterpriseGroupMembersTableData;
