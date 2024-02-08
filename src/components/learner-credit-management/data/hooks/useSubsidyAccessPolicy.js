import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import { isAssignableSubsidyAccessPolicyType } from '../../../../utils';

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
  subsidyAccessPolicy.isAssignable = isAssignableSubsidyAccessPolicyType(subsidyAccessPolicy);
  return subsidyAccessPolicy;
};

const useSubsidyAccessPolicy = (subsidyAccessPolicyId, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
  queryFn: getSubsidyAccessPolicy,
  enabled: !!subsidyAccessPolicyId,
  ...queryOptions,
});

export default useSubsidyAccessPolicy;
