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
) => {
  const [isOpen, open, close] = useToggle(false);
  const [remindButtonState, setRemindButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const remindContentAssignments = useCallback(async () => {
    setRemindButtonState('pending');
    try {
      await EnterpriseAccessApiService.remindContentAssignments(assignmentConfigurationUuid, assignmentUuids);
      setRemindButtonState('complete');
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });
    } catch (err) {
      logError(err);
      setRemindButtonState('error');
    }
  }, [assignmentConfigurationUuid, assignmentUuids, queryClient, subsidyAccessPolicyId]);

  return {
    remindButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  };
};

export default useRemindContentAssignments;
