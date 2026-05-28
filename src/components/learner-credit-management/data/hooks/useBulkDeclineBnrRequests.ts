import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

type DeclineButtonState = 'default' | 'pending' | 'complete' | 'error';

interface UseBulkDeclineBnrRequestsReturn {
  declineButtonState: DeclineButtonState;
  declineBnrRequests: (declineReason?: string) => Promise<void>;
  close: () => void;
  isOpen: boolean;
  open: () => void;
}

const useBulkDeclineBnrRequests = (
  enterpriseId: string,
  requestUuids: string[] = [],
  isEntireTableSelected: boolean = false,
): UseBulkDeclineBnrRequestsReturn => {
  const [isOpen, open, close] = useToggle(false);
  const [declineButtonState, setDeclineButtonState] = useState<DeclineButtonState>('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const declineBnrRequests = useCallback(async (declineReason?: string) => {
    if (!subsidyAccessPolicyId) {
      throw new Error('subsidyAccessPolicyId is required to decline BNR requests');
    }
    setDeclineButtonState('pending');
    let partialFailureError: Error | null = null;
    try {
      const response = isEntireTableSelected
        ? await EnterpriseAccessApiService.declineAllBnrSubsidyRequests({
          enterpriseId,
          subsidyAccessPolicyId,
          declineReason,
        })
        : await EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests({
          enterpriseId,
          subsidyAccessPolicyId,
          subsidyRequestUUIDs: requestUuids,
          declineReason,
        });
      const nonDeclinable = response.data?.non_declinable;
      if (nonDeclinable && nonDeclinable.length > 0) {
        partialFailureError = new Error(`${nonDeclinable.length} request(s) could not be declined`);
      }
    } catch (err) {
      logError(err);
      setDeclineButtonState('error');
      throw err;
    }
    // Always invalidate so any successfully declined rows refresh, even on partial failure.
    queryClient.invalidateQueries({
      queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
    });
    if (partialFailureError) {
      logError(partialFailureError);
      setDeclineButtonState('error');
      throw partialFailureError;
    }
    setDeclineButtonState('complete');
  }, [enterpriseId, subsidyAccessPolicyId, requestUuids, isEntireTableSelected, queryClient]);

  return {
    declineButtonState,
    declineBnrRequests,
    close,
    isOpen,
    open,
  };
};

export default useBulkDeclineBnrRequests;
