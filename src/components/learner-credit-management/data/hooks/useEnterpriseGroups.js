import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { learnerCreditManagementQueryKeys } from '../constants';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * Retrieves a list of enterprise groups associated with the enterprise uuid.
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The enterprise group objects
 */
const getEnterpriseGroups = async ({ enterpriseUuid }) => {
  const response = await LmsApiService.fetchEnterpriseGroups(enterpriseUuid);
  const enterpriseGroups = camelCaseObject(response.data);
  return enterpriseGroups;
};

const useEnterpriseGroups = (enterpriseUuid, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(enterpriseUuid),
  queryFn: () => getEnterpriseGroups({ enterpriseUuid }),
  ...queryOptions,
});

export default useEnterpriseGroups;
