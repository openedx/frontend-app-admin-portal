import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import isEmpty from 'lodash/isEmpty';

import { learnerCreditManagementQueryKeys } from '../constants';
import LmsApiService from '../../../../data/services/LmsApiService';
import { fetchPaginatedData } from '../../../../data/services/apiServiceUtils';

/**
 * Hook to get a list of groups associated with an enterprise customer.
 *
 * @param enterpriseId The enterprise customer UUID.
 * @returns An object with list of groups associated with an enterprise customer and loading state
 */
export const useEnterpriseCustomerFlexGroup = (enterpriseId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseCustomerFlexGroup, setEnterpriseCustomerFlexGroup] = useState([]);

  useEffect(() => {
    const getRemovedMembers = async () => {
      try {
        const { results } = await fetchPaginatedData(LmsApiService.enterpriseGroupListUrl);
        console.log(results)
        const removedMembers = results.filter(result => result.enterpriseCustomer === enterpriseId && result.groupType==='flex');
        console.log(removedMembers)
        setEnterpriseCustomerFlexGroup(removedMembers);
      } catch (e) {
        logError(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (enterpriseId) {
      getRemovedMembers();
    }
  }, [enterpriseId, fetchPaginatedData]);

  return {
    isEnterpriseCustomerFlexGroup: isLoading,
    enterpriseCustomerFlexGroup,
  };
};


/**
 * Retrieves a enterprise group by UUID from the API.
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The enterprise group object
 */
const getEnterpriseGroup = async ({ subsidyAccessPolicy }) => {
  if (isEmpty(subsidyAccessPolicy?.groupAssociations)) {
    return null;
  }
  const response = await LmsApiService.fetchEnterpriseGroup(subsidyAccessPolicy.groupAssociations[0]);
  const enterpriseGroup = camelCaseObject(response.data);
  return enterpriseGroup;
};

const useEnterpriseGroup = (subsidyAccessPolicy, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(subsidyAccessPolicy?.uuid),
  queryFn: () => getEnterpriseGroup({ subsidyAccessPolicy }),
  ...queryOptions,
});

export default useEnterpriseGroup;
