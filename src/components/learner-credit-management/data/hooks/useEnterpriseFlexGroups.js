import { useQuery } from '@tanstack/react-query';

import { learnerCreditManagementQueryKeys } from '../constants';
import { fetchPaginatedData } from '../../../../data/services/apiServiceUtils';
import LmsApiService from '../../../../data/services/LmsApiService';
import { GROUP_TYPE_FLEX } from '../../../PeopleManagement/constants';

export const getGroupMemberEmails = async (groupUUID) => {
  const url = `${LmsApiService.enterpriseGroupUrl}${groupUUID}/learners`;
  const { results } = await fetchPaginatedData(url);
  const memberEmails = results.map(result => result?.memberDetails?.userEmail);
  return memberEmails;
};

/**
 * Hook to get a list of flex groups associated with an enterprise customer.
 *
 * @param enterpriseId The enterprise customer UUID.
 * @returns A list of flex groups associated with an enterprise customer.
 */
export const getEnterpriseFlexGroups = async ({ enterpriseId }) => {
  const { results } = await fetchPaginatedData(LmsApiService.enterpriseGroupListUrl);
  const flexGroups = results.filter(result => (
    result.enterpriseCustomer === enterpriseId && result.groupType === GROUP_TYPE_FLEX));
  return flexGroups;
};

const useEnterpriseFlexGroups = (enterpriseId, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.flexGroup(enterpriseId),
  queryFn: () => getEnterpriseFlexGroups({ enterpriseId }),
  ...queryOptions,
});

export default useEnterpriseFlexGroups;
