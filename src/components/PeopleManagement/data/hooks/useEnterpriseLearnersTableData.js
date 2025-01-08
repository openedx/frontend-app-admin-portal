import {
  useCallback, useMemo, useState,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import LmsApiService from '../../../../data/services/LmsApiService';
import { fetchPaginatedData } from '../../../../data/services/apiServiceUtils';

export const useGetAllEnterpriseLearnerEmails = ({
  enterpriseId,
  onHandleAddMembersBulkAction,
  enterpriseGroupLearners,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [addButtonState, setAddButtonState] = useState('default');

  const fetchLearnerEmails = useCallback(async () => {
    setAddButtonState('pending');
    try {
      const url = `${LmsApiService.enterpriseLearnerUrl}?enterprise_customer=${enterpriseId}`;
      const { results } = await fetchPaginatedData(url);
      const addedMemberEmails = enterpriseGroupLearners.map(learner => learner.memberDetails.userEmail);
      const learnerEmails = results
        .map(result => result?.user?.email)
        .filter(email => email !== undefined)
        .filter(email => !addedMemberEmails.includes(email));
      onHandleAddMembersBulkAction(learnerEmails);
    } catch (error) {
      logError(error);
      setAddButtonState('error');
    } finally {
      setIsLoading(false);
      setAddButtonState('complete');
    }
  }, [enterpriseId, onHandleAddMembersBulkAction, enterpriseGroupLearners]);

  return {
    isLoading,
    fetchLearnerEmails,
    addButtonState,
  };
};

export const useEnterpriseLearnersTableData = (enterpriseId) => {
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
      };
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
  }, [enterpriseId, setEnterpriseCustomerUserTableData]);

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
