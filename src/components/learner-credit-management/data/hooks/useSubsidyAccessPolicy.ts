import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import type { AxiosResponse } from 'axios';
import { useIntl } from '@edx/frontend-platform/i18n';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import { isAssignableSubsidyAccessPolicyType } from '../../../../utils';
import { SubsidyAccessPolicy } from '../types';
import { isBudgetRetiredOrExpired, getBudgetStatus } from '../utils';

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

const useSubsidyAccessPolicy = (subsidyAccessPolicyId) => {
  const intl = useIntl();

  return useQuery({
    queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
    queryFn: getSubsidyAccessPolicy,
    enabled: !!subsidyAccessPolicyId,
    select: (data) => {
      if (!data) {
        return data;
      }

      // Calculate if the budget is retired or expired using getBudgetStatus for consistency
      const { status } = getBudgetStatus({
        intl,
        startDateStr: data.subsidyActiveDatetime,
        endDateStr: data.subsidyExpirationDatetime,
        isBudgetRetired: data.retired,
      });

      return {
        ...data,
        isRetiredOrExpired: isBudgetRetiredOrExpired(status),
      };
    },
  });
};

export default useSubsidyAccessPolicy;
