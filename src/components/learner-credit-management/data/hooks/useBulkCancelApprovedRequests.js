import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';
import { applyFiltersToOptions } from './useBnrSubsidyRequests';

const useBulkCancelApprovedRequests = (
  subsidyRequestUUIDs,
  enterpriseId,
  cancelAll,
  tableFilters,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [cancelButtonState, setCancelButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const cancelApprovedRequests = useCallback(async () => {
    setCancelButtonState('pending');
    try {
      if (cancelAll) {
        const options = {};
        applyFiltersToOptions(tableFilters, options);
        await EnterpriseAccessApiService.cancelAllApprovedBnrSubsidyRequests({
          enterpriseId,
          subsidyAccessPolicyId,
          options,
        });
      } else {
        await EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests({
          enterpriseId,
          subsidyRequestUUIDs,
        });
      }
      setCancelButtonState('complete');
      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });
    } catch (err) {
      logError(err);
      setCancelButtonState('error');
    }
  }, [subsidyRequestUUIDs, enterpriseId, subsidyAccessPolicyId, cancelAll, tableFilters, queryClient]);

  return {
    cancelButtonState,
    cancelApprovedRequests,
    close,
    isOpen,
    open,
  };
};

export default useBulkCancelApprovedRequests;
