import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';
import { applyFiltersToOptions } from './useBudgetContentAssignments';

const useRemindContentAssignments = (
  assignmentConfigurationUuid,
  assignmentUuids,
  remindAll,
  tableFilters,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [remindButtonState, setRemindButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const remindContentAssignments = useCallback(async () => {
    setRemindButtonState('pending');
    try {
      if (remindAll) {
        const options = {};
        applyFiltersToOptions(tableFilters, options);
        await EnterpriseAccessApiService.remindAllContentAssignments(assignmentConfigurationUuid, options);
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
  }, [assignmentConfigurationUuid, assignmentUuids, remindAll, tableFilters, queryClient, subsidyAccessPolicyId]);

  return {
    remindButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  };
};

export default useRemindContentAssignments;
