import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { learnerCreditManagementQueryKeys } from '../constants';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * Retrieves an enterprise group by group UUID from the API.
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The enterprise group object
 */
const getEnterpriseGroupUuid = async ({ groupUuid }) => {
  const response = await LmsApiService.fetchEnterpriseGroup(groupUuid);
  const enterpriseGroup = camelCaseObject(response.data);
  return enterpriseGroup;
};

const useEnterpriseGroupUuid = (groupUuid, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(groupUuid),
  queryFn: () => getEnterpriseGroupUuid({ groupUuid }),
  ...queryOptions,
});

export default useEnterpriseGroupUuid;