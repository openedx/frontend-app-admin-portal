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
const getAllEnterpriseGroups = async ({ enterpriseId }) => {
  const { results } = await fetchPaginatedData(`${LmsApiService.enterpriseGroupListUrl}?enterprise_uuids${enterpriseId}?group_type=flex`);
  return results;
};

const useAllEnterpriseGroups = (enterpriseId, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(enterpriseId),
  queryFn: () => getAllEnterpriseGroups({ enterpriseId }),
  ...queryOptions,
});

export default useAllEnterpriseGroups;
