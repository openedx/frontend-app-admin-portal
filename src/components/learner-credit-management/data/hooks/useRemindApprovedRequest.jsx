import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

const useRemindApprovedRequest = (
  subsidyRequestUUID,
  enterpriseId,
  onSuccess,
  onFailure,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [remindButtonState, setRemindButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const remindApprovedRequests = useCallback(async () => {
    setRemindButtonState('pending');
    try {
      const response = await EnterpriseAccessApiService.remindApprovedBnrSubsidyRequest({
        subsidyRequestUUID,
        enterpriseId,
      });

      setRemindButtonState('complete');

      if (onSuccess) {
        onSuccess(response);
      }

      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });

      return { success: true, response };
    } catch (err) {
      logError(err);
      setRemindButtonState('error');

      if (onFailure) {
        onFailure(err);
      }

      throw err;
    }
  }, [subsidyRequestUUID, queryClient, subsidyAccessPolicyId, enterpriseId, onSuccess, onFailure]);

  return {
    remindButtonState,
    remindApprovedRequests,
    close,
    isOpen,
    open,
  };
};

export default useRemindApprovedRequest;
