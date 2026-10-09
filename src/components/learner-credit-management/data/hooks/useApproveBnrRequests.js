import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

const useApproveBnrRequests = (
  enterpriseId,
  subsidyRequestUuids,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [approveButtonState, setApproveButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const approveBnrRequests = useCallback(async () => {
    setApproveButtonState('pending');
    try {
      await EnterpriseAccessApiService.approveBnrSubsidyRequest({
        enterpriseId,
        subsidyAccessPolicyId,
        subsidyRequestUUIDs: subsidyRequestUuids,
      });
      setApproveButtonState('complete');
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });
    } catch (err) {
      logError(err);
      setApproveButtonState('error');
      throw err;
    }
  }, [enterpriseId, subsidyAccessPolicyId, subsidyRequestUuids, queryClient]);

  return {
    approveButtonState,
    approveBnrRequests,
    close,
    isOpen,
    open,
  };
};

export default useApproveBnrRequests;
