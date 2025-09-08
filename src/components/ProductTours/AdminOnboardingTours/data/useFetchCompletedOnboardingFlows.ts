import { useQuery } from '@tanstack/react-query';

import LmsApiService from '../../../../data/services/LmsApiService';
import { adminOnboardingQueryKeys } from '../constants';
import { camelCaseDict } from '../../../../utils';

/**
 * Fetching the enterprise customer admin's profile to see their completed tour flows
 *
 * @param {adminUuid} queryKey The admin's associated uuid
 * @returns {Object} Transformed admin profile data with camelCase keys
 */

type EnterpriseAdminResponse = {
  uuid?: string;
  enterpriseCustomerUser?: number;
  lastLogin?: string | null;
  completedTourFlows?: any[];
  onboardingTourDismissed?: boolean;
  onboardingTourCompleted?: boolean;
};

export const getFetchCompletedOnboardingFlows = async ({ adminUuid }) : Promise<EnterpriseAdminResponse> => {
  const adminResponse = await LmsApiService.fetchEnterpriseAdminProfile(adminUuid);
  const results = camelCaseDict(adminResponse.data);
  return results;
};

const useFetchCompletedOnboardingFlows = (adminUuid: string) => useQuery({
  queryKey: adminOnboardingQueryKeys.fetchCompletedOnboardingFlows({ adminUuid }),
  queryFn: () => getFetchCompletedOnboardingFlows({ adminUuid }),
});

export default useFetchCompletedOnboardingFlows;
