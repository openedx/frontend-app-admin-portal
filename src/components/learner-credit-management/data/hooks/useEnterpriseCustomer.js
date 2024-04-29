import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { learnerCreditManagementQueryKeys } from '../constants';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * Retrieves a enterprise customer by UUID from the API.
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The enterprise customer object
 */
const getEnterpriseCustomer = async (enterpriseCustomerUuid) => {
  const response = await LmsApiService.fetchEnterpriseCustomer(enterpriseCustomerUuid);
  const enterpriseCustomer = camelCaseObject(response.data);
  return enterpriseCustomer;
};

const useEnterpriseCustomer = (enterpriseCustomerUuid, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.enterpriseCustomer(enterpriseCustomerUuid),
  queryFn: () => getEnterpriseCustomer(enterpriseCustomerUuid),
  ...queryOptions,
});

export default useEnterpriseCustomer;
