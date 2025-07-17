import { useQuery } from '@tanstack/react-query';

import LmsApiService from '../../../../data/services/LmsApiService';
import { adminOnboardingQueryKeys } from '../constants';

/**
 * Retrieves at least one enterprise customer member to validate if the customer has any associated
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns {Boolean} true if there is at least one enterprise customer member, otherwise false
 */
export const getHasEnterpriseMembers = async ({ enterpriseId }) => {
  const response = await LmsApiService.fetchEnterpriseCustomerMember(enterpriseId);
  const hasEnterpriseMembers = response.data.count > 0;
  return hasEnterpriseMembers;
};

const useHasEnterpriseMembers = (enterpriseId, { queryOptions } = {}) => useQuery({
  queryKey: adminOnboardingQueryKeys.hasEnterpriseMembers(enterpriseId),
  queryFn: () => getHasEnterpriseMembers({ enterpriseId }),
  ...queryOptions,
});

export default useHasEnterpriseMembers;
