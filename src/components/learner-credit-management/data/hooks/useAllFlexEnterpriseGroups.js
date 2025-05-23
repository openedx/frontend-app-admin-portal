import { useQuery } from '@tanstack/react-query';

import { learnerCreditManagementQueryKeys } from '../constants';
import LmsApiService from '../../../../data/services/LmsApiService';
import { fetchPaginatedData } from '../../../../data/services/apiServiceUtils';

/**
 * Retrieves all enterprise groups associated with the organization
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The enterprise group object
 */
export const getAllFlexEnterpriseGroups = async ({ enterpriseId }) => {
  const { results } = await fetchPaginatedData(`${LmsApiService.enterpriseGroupListUrl}?enterprise_uuids=${enterpriseId}`);
  return results.filter(result => result.groupType === 'flex');
};

const useAllFlexEnterpriseGroups = (enterpriseId, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(enterpriseId),
  queryFn: () => getAllFlexEnterpriseGroups({ enterpriseId }),
  ...queryOptions,
});

export default useAllFlexEnterpriseGroups;
