import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

const useDeclineBnrRequests = (
  enterpriseId,
  subsidyRequestUuids,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [declineButtonState, setDeclineButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const declineBnrRequests = useCallback(async (declineReason) => {
    setDeclineButtonState('pending');
    try {
      // Process requests sequentially - if one fails, stop processing
      // This implements the "atomic" behavior requested in the ticket
      for (let i = 0; i < subsidyRequestUuids.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await EnterpriseAccessApiService.declineBnrSubsidyRequest({
          enterpriseId,
          subsidyRequestUUID: subsidyRequestUuids[i],
          sendNotification: true,
          declineReason,
        });
      }
      setDeclineButtonState('complete');
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });
    } catch (err) {
      logError(err);
      setDeclineButtonState('error');
      throw err;
    }
  }, [enterpriseId, subsidyAccessPolicyId, subsidyRequestUuids, queryClient]);

  return {
    declineButtonState,
    declineBnrRequests,
    close,
    isOpen,
    open,
  };
};

export default useDeclineBnrRequests;
