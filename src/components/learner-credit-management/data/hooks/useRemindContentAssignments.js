import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@edx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys, useBudgetId } from '..';

const useRemindContentAssignments = (
  assignmentConfigurationUuid,
  assignmentUuids,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [assignButtonState, setAssignButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const remindContentAssignments = useCallback(async () => {
    setAssignButtonState('pending');
    try {
      await EnterpriseAccessApiService.remindAssignments(assignmentConfigurationUuid, assignmentUuids);
      setAssignButtonState('complete');
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });
    } catch (err) {
      logError(err);
      setAssignButtonState('error');
    }
  }, [assignmentConfigurationUuid, assignmentUuids, queryClient, subsidyAccessPolicyId]);

  return {
    assignButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  };
};

export default useRemindContentAssignments;
