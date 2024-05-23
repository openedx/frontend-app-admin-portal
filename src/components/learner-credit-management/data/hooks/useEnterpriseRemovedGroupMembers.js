import {
  useState, useEffect, useCallback,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

const useEnterpriseRemovedGroupMembers = ({ policyUuid, groupId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [removedGroupMembers, setRemovedGroupMembers] = useState([]);

  const fetchPaginatedData = useCallback(async (page, results = []) => {
    const options = { group_uuid: groupId, show_removed: true, page };
    const response = await EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData(policyUuid, options);
    const responseData = camelCaseObject(response.data);
    const resultsCopy = [...results];
    resultsCopy.push(...responseData.results);
    if (responseData.next) {
      return fetchPaginatedData(page + 1, resultsCopy);
    }
    return resultsCopy;
  }, [policyUuid, groupId]);

  useEffect(() => {
    const getRemovedMembers = async () => {
      try {
        const startingPageIndex = 1;
        const results = await fetchPaginatedData(startingPageIndex);
        const removedMembers = results.filter(result => result.status === 'removed');
        setRemovedGroupMembers(removedMembers);
      } catch (e) {
        logError(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (policyUuid) {
      getRemovedMembers();
    }
  }, [groupId, policyUuid, fetchPaginatedData]);

  return {
    isRemovedMembersLoading: isLoading,
    removedGroupMembersCount: removedGroupMembers.length,
  };
};

export default useEnterpriseRemovedGroupMembers;
