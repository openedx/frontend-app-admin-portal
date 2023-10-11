import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

const determineBudgetAssignability = (policyType) => {
  const assignableSubsidyAccessPolicyTypes = ['AssignedLearnerCreditAccessPolicy'];
  return assignableSubsidyAccessPolicyTypes.includes(policyType);
};

const getSubsidyAccessPolicy = async ({ queryKey }) => {
  const response = await EnterpriseAccessApiService.retrieveSubsidyAccessPolicy(queryKey[2]);
  const subsidyAccessPolicy = camelCaseObject(response.data);
  subsidyAccessPolicy.isAssignable = determineBudgetAssignability(subsidyAccessPolicy.policyType);
  return subsidyAccessPolicy;
};

const useSubsidyAccessPolicy = (subsidyAccessPolicyId) => useQuery({
  queryKey: ['learner-credit-management', 'policy', subsidyAccessPolicyId],
  queryFn: getSubsidyAccessPolicy,
  enabled: !!subsidyAccessPolicyId,
});

export default useSubsidyAccessPolicy;
