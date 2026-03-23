import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';

const useBulkCancelApprovedRequests = ({
  subsidyRequestUUIDs,
  enterpriseId,
  onSuccess,
  onFailure,
  onPartialFailure,
}) => {
  const [isOpen, open, close] = useToggle(false);
  const [cancelButtonState, setCancelButtonState] = useState('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const cancelApprovedRequests = useCallback(async () => {
    setCancelButtonState('pending');

    try {
      const response = await EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests({
        enterpriseId,
        subsidyRequestUUIDs,
      });

      setCancelButtonState('complete');

      // Check for partial failures in response
      if (response?.data?.failed_request_uuids && response.data.failed_request_uuids.length > 0) {
        // Partial failure: some succeeded, some failed
        if (onPartialFailure) {
          onPartialFailure({
            failedUUIDs: response.data.failed_request_uuids,
            successfulUUIDs: subsidyRequestUUIDs.filter(
              uuid => !response.data.failed_request_uuids.includes(uuid),
            ),
          });
        }
      }

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
  }, [subsidyRequestUUIDs, enterpriseId, queryClient, subsidyAccessPolicyId, onSuccess, onFailure, onPartialFailure]);

  return {
    cancelButtonState,
    cancelApprovedRequests,
    close,
    isOpen,
    open,
  };
};

export default useBulkCancelApprovedRequests;
