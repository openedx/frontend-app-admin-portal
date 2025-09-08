import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { generateKey } from '../constants';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

/**
 * Fetches enterprise budgets.
 *
 * @param {String} enterpriseCustomerUUID - UUID of the enterprise customer.
 * @param {object} queryOptions - Additional options for the query.
 */
const useEnterpriseBudgets = ({
  enterpriseCustomerUUID,
  queryOptions = {},
}) => {
  const requestOptions = { };
  const response = useQuery({
    queryKey: generateKey('budgets', enterpriseCustomerUUID, requestOptions),
    queryFn: () => EnterpriseDataApiService.fetchEnterpriseBudgets(enterpriseCustomerUUID),
    staleTime: 0.5 * (1000 * 60 * 60), // 30 minutes. Data considered stale after this duration
    cacheTime: 0.75 * (1000 * 60 * 60), // 45 minutes. Cache GC after this duration
    keepPreviousData: true,
    ...queryOptions,
  });

  return useMemo(() => camelCaseObject({
    data: response?.data?.data,
    isFetching: false,
  }), [response]);
};

export default useEnterpriseBudgets;
