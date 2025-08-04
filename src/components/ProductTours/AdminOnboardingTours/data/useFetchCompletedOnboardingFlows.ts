import { useQuery } from '@tanstack/react-query';

import LmsApiService from '../../../../data/services/LmsApiService';
import { adminOnboardingQueryKeys } from '../constants';
import { camelCaseDict } from '../../../../utils';

/**
 * Fetching the enterprise customer admin's profile to see their completed tour flows
 *
 * @param {adminUuid} queryKey The admin's associated uuid
 * @returns {String[]} Array of completed tour flow uuids
 */

export const getFetchCompletedOnboardingFlows = async ({ adminUuid }) : Promise<string[]> => {
  const adminResponse = await LmsApiService.fetchEnterpriseAdminProfile(adminUuid);
  const results = camelCaseDict(adminResponse.data);
  return results.completedTourFlows;
};

const useFetchCompletedOnboardingFlows = (adminUuid: string) => useQuery({
  queryKey: adminOnboardingQueryKeys.fetchCompletedOnboardingFlows({ adminUuid }),
  queryFn: () => getFetchCompletedOnboardingFlows({ adminUuid }),
});

export default useFetchCompletedOnboardingFlows;
