import {
  useCallback, useMemo, useState,
} from 'react';
import _ from 'lodash';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import LmsApiService from '../../../../data/services/LmsApiService';
import { transformGroupMembersTableResults } from '../utils';

const useEnterpriseGroupMembersTableData = ({ groupId, refresh }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showRemoved, setShowRemoved] = useState(false);
  const handleSwitchChange = e => setShowRemoved(e.target.checked);
  const [enterpriseGroupMembersTableData, setEnterpriseGroupMembersTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });
  const fetchEnterpriseGroupMembersData = useCallback((args) => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const options = {};
        if (args?.filters.length > 0) {
          options.user_query = args.filters[0].value;
        }
        if (args?.sortBy.length > 0) {
          const sortByValue = args.sortBy[0].id;
          options.sort_by = _.snakeCase(sortByValue);
          if (!args.sortBy[0].desc) {
            options.is_reversed = args.sortBy[0].desc;
          }
        } if (showRemoved) {
          options.show_removed = true;
        }
        options.page = args.pageIndex + 1;
        const response = await LmsApiService.fetchEnterpriseGroupLearners(groupId, options);
        const data = camelCaseObject(response.data);
        const transformedTableResults = transformGroupMembersTableResults(data.results);

        setEnterpriseGroupMembersTableData({
          itemCount: data.count,
          // If the data comes from the subsidy transactions endpoint, the number of pages is calculated
          // TODO: https://2u-internal.atlassian.net/browse/ENT-8106
          pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
          results: transformedTableResults,
        });
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (groupId) {
      fetch();
    }
  }, [groupId, showRemoved]);

  const debouncedFetchEnterpriseGroupMembersData = useMemo(
    () => debounce(fetchEnterpriseGroupMembersData, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchEnterpriseGroupMembersData, refresh],
  );

  return {
    isLoading,
    showRemoved,
    handleSwitchChange,
    enterpriseGroupMembersTableData,
    fetchEnterpriseGroupMembersTableData: debouncedFetchEnterpriseGroupMembersData,
  };
};

export default useEnterpriseGroupMembersTableData;
