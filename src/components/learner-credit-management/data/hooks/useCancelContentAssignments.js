import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@edx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';
import { applyFiltersToOptions } from './useBudgetContentAssignments';

const useCancelContentAssignments = (
  assignmentConfigurationUuid,
  assignmentUuids,
  cancelAll,
  tableFilters,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [cancelButtonState, setCancelButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const cancelContentAssignments = useCallback(async () => {
    setCancelButtonState('pending');
    try {
      if (cancelAll) {
        const options = {};
        applyFiltersToOptions(tableFilters, options);
        await EnterpriseAccessApiService.cancelAllContentAssignments(assignmentConfigurationUuid, options);
      } else {
        await EnterpriseAccessApiService.cancelContentAssignments(assignmentConfigurationUuid, assignmentUuids);
      }
      setCancelButtonState('complete');
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });
    } catch (err) {
      logError(err);
      setCancelButtonState('error');
    }
  }, [assignmentConfigurationUuid, assignmentUuids, cancelAll, tableFilters, queryClient, subsidyAccessPolicyId]);

  return {
    cancelButtonState,
    cancelContentAssignments,
    close,
    isOpen,
    open,
  };
};

export default useCancelContentAssignments;
