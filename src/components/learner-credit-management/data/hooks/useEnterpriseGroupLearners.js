import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import LmsApiService from '../../../../data/services/LmsApiService';
import { learnerCreditManagementQueryKeys } from '../constants';

const getEnterpriseGroupLearners = async ({ queryKey }) => {
  const subsidyAccessPolicyUUID = queryKey[2];
  const response = await LmsApiService.fetchEnterpriseGroupLearners(subsidyAccessPolicyUUID);
  const enterpriseGroupLearners = camelCaseObject(response.data);
  return enterpriseGroupLearners;
};

const useEnterpriseGroupLearners = (enterpriseGroupUuid, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.budgetGroupLearners(enterpriseGroupUuid),
  queryFn: getEnterpriseGroupLearners,
  enabled: !!enterpriseGroupUuid,
  ...queryOptions,
});

export default useEnterpriseGroupLearners;
