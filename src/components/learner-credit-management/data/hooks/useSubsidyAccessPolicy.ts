import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import type { AxiosResponse } from 'axios';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import { isAssignableSubsidyAccessPolicyType } from '../../../../utils';
import { SubsidyAccessPolicy } from '../types';

/**
 * Retrieves a subsidy access policy by UUID from the API.
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The subsidy access policy object, with the `isAssignable` property added.
 */
const getSubsidyAccessPolicy = async ({ queryKey }) => {
  const subsidyAccessPolicyUUID = queryKey[2];
  const response: AxiosResponse = await EnterpriseAccessApiService.retrieveSubsidyAccessPolicy(subsidyAccessPolicyUUID);
  const subsidyAccessPolicy: SubsidyAccessPolicy = camelCaseObject(response.data);
  subsidyAccessPolicy.isAssignable = isAssignableSubsidyAccessPolicyType(subsidyAccessPolicy);
  return subsidyAccessPolicy;
};

const useSubsidyAccessPolicy = (subsidyAccessPolicyId) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
  queryFn: getSubsidyAccessPolicy,
  enabled: !!subsidyAccessPolicyId,
});

export default useSubsidyAccessPolicy;
