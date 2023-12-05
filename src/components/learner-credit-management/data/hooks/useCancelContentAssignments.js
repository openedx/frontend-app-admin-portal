import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@edx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

const useCancelContentAssignments = (
  assignmentConfigurationUuid,
  assignmentUuids,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [assignButtonState, setAssignButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const cancelContentAssignments = useCallback(async () => {
    setAssignButtonState('pending');
    try {
      await EnterpriseAccessApiService.cancelContentAssignments(assignmentConfigurationUuid, assignmentUuids);
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
    cancelContentAssignments,
    close,
    isOpen,
    open,
  };
};

export default useCancelContentAssignments;
