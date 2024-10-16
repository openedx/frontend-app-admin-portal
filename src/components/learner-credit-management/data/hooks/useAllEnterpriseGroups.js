import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { learnerCreditManagementQueryKeys } from '../constants';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * Retrieves all enterprise groups associated with the organization
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The enterprise group object
 */
const getAllEnterpriseGroups = async ({ enterpriseId }) => {
  const params = new URLSearchParams({
    enterprise_uuids: enterpriseId,
    group_type: 'flex',
    page: 1,
  });
  const response = await LmsApiService.fetchAllEnterpriseGroups(params);
  const enterpriseGroups = camelCaseObject(response.data);
  return enterpriseGroups;
};

const useAllEnterpriseGroups = (enterpriseId, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(enterpriseId),
  queryFn: () => getAllEnterpriseGroups({ enterpriseId }),
  ...queryOptions,
});

export default useAllEnterpriseGroups;
