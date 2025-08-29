import { useQuery } from '@tanstack/react-query';

import LmsApiService from '../../../../data/services/LmsApiService';
import { adminOnboardingQueryKeys } from '../constants';

export type HydratedAdminOnboardingData = {
  hasEnterpriseMembers: boolean;
  hasEnterpriseGroups: boolean;
};

/**
 * Retrieves information needed for the admin onboarding tour to preload it before the flow is selected
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns {HydratedAdminOnboardingData} True if the enterprise has members and if they have groups
 */
export const getHydrateAdminOnboardingData = async ({ enterpriseId }) : Promise<HydratedAdminOnboardingData> => {
  const membersResponse = await LmsApiService.fetchEnterpriseCustomerMember(enterpriseId);
  const hasEnterpriseMembers = membersResponse.data.count > 0;

  const groupsResponse = await LmsApiService.fetchEnterpriseGroupsByEnterprise(enterpriseId);
  const groupsData = groupsResponse.data.results;
  const hasEnterpriseGroups = (groupsData.filter(result => result.groupType === 'flex')).length > 0;
  return { hasEnterpriseMembers, hasEnterpriseGroups };
};

const useHydrateAdminOnboardingData = (enterpriseId: string) => useQuery({
  queryKey: adminOnboardingQueryKeys.hydrateAdminOnboardingData({ enterpriseId }),
  queryFn: () => getHydrateAdminOnboardingData({ enterpriseId }),
});

export default useHydrateAdminOnboardingData;
