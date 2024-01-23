import { useEffect } from 'react';

import {
  useMutation, useQuery,
} from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';

import LmsApiService from '../../../../data/services/LmsApiService';

const useUpdateActiveEnterpriseForUser = ({ enterpriseId, user }) => {
  // Sets up POST call to update active enterprise.
  const { mutate, isLoading: isUpdatingActiveEnterprise } = useMutation({
    mutationFn: () => LmsApiService.updateUserActiveEnterprise(enterpriseId),
    onError: () => {
      logError("Failed to update user's active enterprise");
    },
  });
  const { username } = user;
  const {
    data,
    isLoading: isLoadingActiveEnterprise,
  } = useQuery({
    queryKey: ['activeLinkedEnterpriseCustomer', username],
    queryFn: () => LmsApiService.getActiveLinkedEnterprise(username),
    meta: {
      errorMessage: "Failed to fetch user's active enterprise",
    },
  });

  useEffect(() => {
    if (!data) { return; }
    if (data.uuid !== enterpriseId) {
      mutate(enterpriseId);
    }
  }, [data, enterpriseId, mutate]);

  return {
    isLoading: isLoadingActiveEnterprise || isUpdatingActiveEnterprise,
  };
};

export default useUpdateActiveEnterpriseForUser;
