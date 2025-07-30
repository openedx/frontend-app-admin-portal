import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

const useCancelApprovedRequest = (
  enterpriseId,
  subsidyRequestUUID,
  onSuccess,
  onFailure,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [cancelButtonState, setCancelButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const cancelApprovedRequest = useCallback(async () => {
    setCancelButtonState('pending');
    try {
      const response = await EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest({
        enterpriseId,
        subsidyRequestUUID,
      });

      setCancelButtonState('complete');

      if (onSuccess) {
        onSuccess(response);
      }

      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });

      return { success: true, response };
    } catch (err) {
      logError(err);
      setCancelButtonState('error');

      if (onFailure) {
        onFailure(err);
      }

      throw err;
    }
  }, [enterpriseId, subsidyRequestUUID, queryClient, subsidyAccessPolicyId, onSuccess, onFailure]);

  return {
    cancelButtonState,
    cancelApprovedRequest,
    close,
    isOpen,
    open,
  };
};

export default useCancelApprovedRequest;
