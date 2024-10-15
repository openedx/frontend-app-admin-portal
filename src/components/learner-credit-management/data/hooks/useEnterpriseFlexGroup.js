import { useQuery } from '@tanstack/react-query';

import { learnerCreditManagementQueryKeys } from '../constants';
import { fetchPaginatedData } from '../../../../data/services/apiServiceUtils';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * Hook to get a list of flex groups associated with an enterprise customer.
 *
 * @param enterpriseId The enterprise customer UUID.
 * @returns A list of flex groups associated with an enterprise customer.
 */
export const getEnterpriseFlexGroup = async ({ queryKey }) => {
  const enterpriseId = queryKey[2];
  console.log(queryKey)
  const { results } = await fetchPaginatedData(LmsApiService.enterpriseGroupListUrl);
  const removedMembers = results.filter(result => result.enterpriseCustomer === enterpriseId && result.groupType === 'flex');
  return removedMembers
};

const useEnterpriseFlexGroup = (enterpriseId, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.flexGroup(enterpriseId),
  queryFn: getEnterpriseFlexGroup,
  ...queryOptions,
});

export default useEnterpriseFlexGroup;
