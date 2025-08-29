import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';

import { learnerCreditManagementQueryKeys } from '../constants';
import { SubsidyAccessPolicy } from '../types';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * Retrieves a enterprise group by the policy from the API.
 * @returns The enterprise group object
 */
export const getEnterpriseGroup = async ({ subsidyAccessPolicy }: { subsidyAccessPolicy?: SubsidyAccessPolicy }) => {
  if (!subsidyAccessPolicy || isEmpty(subsidyAccessPolicy.groupAssociations)) {
    return null;
  }
  const response = await LmsApiService.fetchEnterpriseGroup(subsidyAccessPolicy.groupAssociations[0]);
  return response.data;
};

const useEnterpriseGroup = (subsidyAccessPolicy: SubsidyAccessPolicy | undefined) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(subsidyAccessPolicy?.uuid),
  queryFn: () => getEnterpriseGroup({ subsidyAccessPolicy }),
});

export default useEnterpriseGroup;
