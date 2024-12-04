import {
  useCallback, useMemo, useState,
} from 'react';
import _ from 'lodash';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import LmsApiService from '../../../../data/services/LmsApiService';

const useEnterpriseGroupLearnersTableData = ({ groupUuid, isAddMembersModalOpen }) => {
  const [isLoading, setIsLoading] = useState(true);
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
          options.sort_by = _.snakeCase(sortByValue);
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
    [fetchEnterpriseGroupLearnersData],
  );

  return {
    isLoading,
    enterpriseGroupLearnersTableData,
    fetchEnterpriseGroupLearnersTableData: debouncedFetchEnterpriseGroupLearnersData,
  };
};

export default useEnterpriseGroupLearnersTableData;
