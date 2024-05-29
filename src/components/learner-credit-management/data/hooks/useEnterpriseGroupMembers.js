import {
  useState, useEffect, useCallback,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

const useEnterpriseGroupMembers = ({ policyUuid, groupId, includeRemoved }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [groupMembers, setGroupMembers] = useState([]);
  const [removedGroupMembers, setRemovedGroupMembers] = useState([]);

  const fetchPaginatedData = useCallback(async (page, results = []) => {
    const options = { group_uuid: groupId, show_removed: includeRemoved, page };
    const response = await EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData(policyUuid, options);
    const responseData = camelCaseObject(response.data);
    const resultsCopy = [...results];
    resultsCopy.push(...responseData.results);
    if (responseData.next) {
      return fetchPaginatedData(page + 1, resultsCopy);
    }
    return resultsCopy;
  }, [policyUuid, groupId, includeRemoved]);

  useEffect(() => {
    const getMembers = async () => {
      try {
        const startingPageIndex = 1;
        const results = await fetchPaginatedData(startingPageIndex);
        setGroupMembers(results);
        const removedMembers = results.filter(result => result.status === 'removed');
        setRemovedGroupMembers(removedMembers);
      } catch (e) {
        logError(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (policyUuid) {
      getMembers();
    }
  }, [groupId, policyUuid, fetchPaginatedData]);

  return {
    isMembersLoading: isLoading,
    groupMembersCount: groupMembers.length,
    removedGroupMembersCount: removedGroupMembers.length,
  };
};

export default useEnterpriseGroupMembers;
