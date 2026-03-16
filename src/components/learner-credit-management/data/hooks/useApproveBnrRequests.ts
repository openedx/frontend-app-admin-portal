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
  requestUuids: string[] = [],
  isEntireTableSelected: boolean = false,
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
      if (isEntireTableSelected) {
        const response = await EnterpriseAccessApiService.approveAllBnrSubsidyRequests({
          enterpriseId,
          subsidyAccessPolicyId,
        });
        // Check for partial failures in the response
        const failedRequests = response.data?.failed;
        if (failedRequests && failedRequests.length > 0) {
          const errorMessage = response.data?.error_message || `${failedRequests.length} request(s) failed to approve`;
          throw new Error(errorMessage);
        }
      } else {
        await EnterpriseAccessApiService.approveBnrSubsidyRequest({
          enterpriseId,
          subsidyAccessPolicyId,
          subsidyRequestUUIDs: requestUuids,
        });
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
  }, [enterpriseId, subsidyAccessPolicyId, requestUuids, isEntireTableSelected, queryClient]);

  return {
    approveButtonState,
    approveBnrRequests,
    close,
    isOpen,
    open,
  };
};

export default useApproveBnrRequests;
