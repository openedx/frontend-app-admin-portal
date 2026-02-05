import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

type ApproveButtonState = 'default' | 'pending' | 'complete' | 'error';

interface UseApproveBnrRequestsReturn {
  approveButtonState: ApproveButtonState;
  approveBnrRequests: () => Promise<void>;
  close: () => void;
  isOpen: boolean;
  open: () => void;
}

const useApproveBnrRequests = (
  enterpriseId: string,
  subsidyRequestUuids: string[],
): UseApproveBnrRequestsReturn => {
  const [isOpen, open, close] = useToggle(false);
  const [approveButtonState, setApproveButtonState] = useState<ApproveButtonState>('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const approveBnrRequests = useCallback(async () => {
    if (!subsidyAccessPolicyId) {
      throw new Error('subsidyAccessPolicyId is required to approve BNR requests');
    }
    setApproveButtonState('pending');
    try {
      const response = await EnterpriseAccessApiService.approveBnrSubsidyRequest({
        enterpriseId,
        subsidyAccessPolicyId,
        subsidyRequestUUIDs: subsidyRequestUuids,
      });
      // Check for partial failures in the response
      const failedRequests = response.data?.failed;
      if (failedRequests && failedRequests.length > 0) {
        throw new Error(`${failedRequests.length} request(s) failed to approve`);
      }
      setApproveButtonState('complete');
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(
          subsidyAccessPolicyId,
        ),
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
