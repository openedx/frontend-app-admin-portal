import { useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { learnerCreditManagementQueryKeys } from '../constants';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * Retrieves a enterprise group by the policy the  from the API.
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The enterprise group object
 */
const getEnterpriseGroup = async ({ subsidyAccessPolicy }) => {
  if (isEmpty(subsidyAccessPolicy?.groupAssociations)) {
    return null;
  }
  const response = await LmsApiService.fetchEnterpriseGroup(subsidyAccessPolicy.groupAssociations[0]);
  return response.data;
};

const useEnterpriseGroup = (subsidyAccessPolicy, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(subsidyAccessPolicy?.uuid),
  queryFn: () => getEnterpriseGroup({ subsidyAccessPolicy }),
  ...queryOptions,
});

export default useEnterpriseGroup;
