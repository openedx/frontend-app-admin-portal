import { useCallback, useMemo, useState } from 'react';
import { debounce, snakeCase } from 'lodash-es';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import LmsApiService from '../../../../data/services/LmsApiService';

const useEnterpriseGroupLearnersTableData = ({ groupUuid, isAddMembersModalOpen }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [enterpriseGroupLearnersTableData, setEnterpriseGroupLearnersTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });
  const fetchEnterpriseGroupLearnersData = useCallback((args) => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const options = {};
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
        const response = await LmsApiService.fetchEnterpriseGroupLearners(groupUuid, options);
        const data = camelCaseObject(response.data);

        setEnterpriseGroupLearnersTableData({
          itemCount: data.count,
          pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
          results: data.results.filter(result => result.activatedAt),
          options,
        });
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupUuid, isAddMembersModalOpen]);

  const debouncedFetchEnterpriseGroupLearnersData = useMemo(
    () => debounce(fetchEnterpriseGroupLearnersData, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchEnterpriseGroupLearnersData, refresh],
  );

  const fetchAllEnterpriseGroupLearnersData = useCallback(async () => {
    const { options, itemCount } = enterpriseGroupLearnersTableData;
    const fetchAllOptions = { ...options, page: 1, page_size: itemCount };
    const response = await LmsApiService.fetchEnterpriseGroupLearners(groupUuid, fetchAllOptions);
    return camelCaseObject(response.data);
  }, [groupUuid, enterpriseGroupLearnersTableData]);

  return {
    isLoading,
    enterpriseGroupLearnersTableData,
    fetchEnterpriseGroupLearnersTableData: debouncedFetchEnterpriseGroupLearnersData,
    fetchAllEnterpriseGroupLearnersData,
    refresh,
    setRefresh,
  };
};
export default useEnterpriseGroupLearnersTableData;
