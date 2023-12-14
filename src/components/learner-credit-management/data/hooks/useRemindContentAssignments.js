import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

const useRemindContentAssignments = (
  assignmentConfigurationUuid,
  assignmentUuids,
  remindAll = false,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [remindButtonState, setRemindButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const remindContentAssignments = useCallback(async () => {
    setRemindButtonState('pending');
    try {
      if (remindAll) {
        await EnterpriseAccessApiService.remindAllContentAssignments(assignmentConfigurationUuid);
      } else {
        await EnterpriseAccessApiService.remindContentAssignments(assignmentConfigurationUuid, assignmentUuids);
      }
      setRemindButtonState('complete');
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });
    } catch (err) {
      logError(err);
      setRemindButtonState('error');
    }
  }, [assignmentConfigurationUuid, assignmentUuids, remindAll, queryClient, subsidyAccessPolicyId]);

  return {
    remindButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  };
};

export default useRemindContentAssignments;
