import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

const determineBudgetAssignability = (policyType) => {
  const assignableSubsidyAccessPolicyTypes = ['AssignedLearnerCreditAccessPolicy'];
  return assignableSubsidyAccessPolicyTypes.includes(policyType);
};

/**
 * Retrieves a subsidy access policy by UUID from the API.
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The subsidy access policy object, with the `isAssignable` property added.
 */
const getSubsidyAccessPolicy = async ({ queryKey }) => {
  const subsidyAccessPolicyUUID = queryKey[2];
  const response = await EnterpriseAccessApiService.retrieveSubsidyAccessPolicy(subsidyAccessPolicyUUID);
  const subsidyAccessPolicy = camelCaseObject(response.data);
  subsidyAccessPolicy.isAssignable = determineBudgetAssignability(subsidyAccessPolicy.policyType);
  return subsidyAccessPolicy;
};

const useSubsidyAccessPolicy = (subsidyAccessPolicyId, { queryOptions } = {}) => useQuery({
  queryKey: ['learner-credit-management', 'subsidy-access-policy', subsidyAccessPolicyId],
  queryFn: getSubsidyAccessPolicy,
  enabled: !!subsidyAccessPolicyId,
  ...queryOptions,
});

export default useSubsidyAccessPolicy;
