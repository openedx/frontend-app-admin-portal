import { useCallback, useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

export const useLearnerCreditBrowseAndRequest = (enterpriseUuid) => {
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [hasBnrEnabledPolicy, setHasBnrEnabledPolicy] = useState(false);

  const fetchPolicies = useCallback(async () => {
    try {
      setIsLoadingPolicies(true);
      const response = await EnterpriseAccessApiService.listSubsidyAccessPolicies(enterpriseUuid);
      const policies = camelCaseObject(response?.data?.results) || [];
      const hasBnrPolicy = policies.some(policy => policy.bnrEnabled);
      setHasBnrEnabledPolicy(hasBnrPolicy);
    } catch (error) {
      logError(error);
    } finally {
      setIsLoadingPolicies(false);
    }
  }, [enterpriseUuid]);

  useEffect(() => {
    if (enterpriseUuid) {
      fetchPolicies();
    }
  }, [enterpriseUuid, fetchPolicies]);

  return {
    isLoadingPolicies,
    hasBnrEnabledPolicy,
  };
};
