import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@openedx/paragon';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../constants';
import useBudgetId from './useBudgetId';
import { applyFiltersToOptions } from './useBnrSubsidyRequests';

/**
 * Represents a table filter from DataTable state.
 */
export interface TableFilter {
  id: string;
  value: unknown;
}

/**
 * Parameters for the useBulkRemindApprovedRequests hook.
 */
export interface UseBulkRemindApprovedRequestsParams {
  /** Array of request UUIDs to remind */
  subsidyRequestUuids: string[];
  /** The enterprise customer UUID */
  enterpriseId: string;
  /** If true, remind all requests matching filters instead of specific UUIDs */
  remindAll?: boolean;
  /** Table filters to apply when remindAll is true */
  tableFilters?: TableFilter[];
  /** Callback to execute on successful remind */
  onSuccess?: () => void;
  /** Callback to execute on failed remind */
  onFailure?: (error: Error) => void;
}

/** Button state for the remind action */
export type RemindButtonState = 'default' | 'pending' | 'complete' | 'error';

/**
 * Return type for the useBulkRemindApprovedRequests hook.
 */
export interface UseBulkRemindApprovedRequestsReturn {
  /** Current state of the remind button */
  remindButtonState: RemindButtonState;
  /** Function to trigger the remind API call */
  remindApprovedRequests: () => Promise<void>;
  /** Function to close the modal */
  close: () => void;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to open the modal */
  open: () => void;
}

/**
 * Hook for handling bulk remind operations on approved BNR (Browse and Request) subsidy requests.
 * Supports both reminding specific requests by UUID and reminding all requests matching filters.
 *
 * @param params - The hook parameters
 * @returns Hook state and functions for managing bulk remind operations
 *
 * @example
 * // Remind specific requests
 * const { remindApprovedRequests, isOpen, open, close } = useBulkRemindApprovedRequests({
 *   subsidyRequestUuids: ['uuid-1', 'uuid-2'],
 *   enterpriseId: 'enterprise-uuid',
 * });
 *
 * @example
 * // Remind all requests matching filters
 * const { remindApprovedRequests } = useBulkRemindApprovedRequests({
 *   subsidyRequestUuids: [],
 *   enterpriseId: 'enterprise-uuid',
 *   remindAll: true,
 *   tableFilters: [{ id: 'learnerRequestState', value: 'waiting' }],
 * });
 */
const useBulkRemindApprovedRequests = ({
  subsidyRequestUuids,
  enterpriseId,
  remindAll = false,
  tableFilters = [],
  onSuccess,
  onFailure,
}: UseBulkRemindApprovedRequestsParams): UseBulkRemindApprovedRequestsReturn => {
  const [isOpen, open, close] = useToggle(false);
  const [remindButtonState, setRemindButtonState] = useState<RemindButtonState>('default');
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();

  const remindApprovedRequests = useCallback(async () => {
    if (!subsidyAccessPolicyId) {
      throw new Error('subsidyAccessPolicyId is required to remind BNR requests');
    }
    setRemindButtonState('pending');
    try {
      if (remindAll) {
        const options: Record<string, unknown> = {};
        applyFiltersToOptions(tableFilters, options);
        await EnterpriseAccessApiService.remindAllApprovedBnrSubsidyRequests({
          enterpriseId,
          subsidyAccessPolicyId,
          options,
        });
      } else {
        await EnterpriseAccessApiService.remindApprovedBnrSubsidyRequests({
          enterpriseId,
          subsidyRequestUuids,
        });
      }
      setRemindButtonState('complete');

      if (onSuccess) {
        onSuccess();
      }

      queryClient.invalidateQueries({
        queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
      });
    } catch (err) {
      logError(err);
      setRemindButtonState('error');

      if (onFailure) {
        onFailure(err as Error);
      }
    }
  }, [
    subsidyRequestUuids,
    enterpriseId,
    subsidyAccessPolicyId,
    remindAll,
    tableFilters,
    queryClient,
    onSuccess,
    onFailure,
  ]);

  return {
    remindButtonState,
    remindApprovedRequests,
    close,
    isOpen,
    open,
  };
};

export default useBulkRemindApprovedRequests;
