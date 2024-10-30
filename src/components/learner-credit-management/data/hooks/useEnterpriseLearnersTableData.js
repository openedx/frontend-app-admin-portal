import {
  useCallback, useMemo, useState,
} from 'react';
import _ from 'lodash';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import LmsApiService from '../../../../data/services/LmsApiService';

const useEnterpriseLearnersTableData = (enterpriseId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseCustomerUserTableData, setEnterpriseCustomerUserTableData] = useState({
    itemCount: 0,
    pageCount: 0,
    results: [],
  });
  const fetchEnterpriseLearnersData = useCallback(async (args) => {
    try {
      setIsLoading(true);
      const options = {
        enterprise_customer: enterpriseId,
      }
      options.page = args.pageIndex + 1;
      const response = await LmsApiService.fetchEnterpriseLearners(options);
      const { data } = camelCaseObject(response);
      setEnterpriseCustomerUserTableData({
        itemCount: data.count,
        pageCount: data.numPages ?? Math.floor(data.count / options.pageSize),
        results: data.results,
      });
    } catch (error) {
      logError(error);
    } finally {
      setIsLoading(false);
    }
  }, [setEnterpriseCustomerUserTableData]);

  const debouncedFetchEnterpriseLearnersData = useMemo(
    () => debounce(fetchEnterpriseLearnersData, 300),
    [fetchEnterpriseLearnersData],
  );

  return {
    isLoading,
    enterpriseCustomerUserTableData,
    fetchEnterpriseLearnersData: debouncedFetchEnterpriseLearnersData,
  };
};

export default useEnterpriseLearnersTableData;
