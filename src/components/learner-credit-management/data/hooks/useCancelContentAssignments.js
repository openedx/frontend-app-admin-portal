import { useCallback, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@edx/paragon';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

const generateSuccessCancelMessage = (assignmentUuids) => {
  if (Array.isArray(assignmentUuids)) {
    return `Assignments cancelled (${assignmentUuids.length})`;
  }

  return 'Assignment cancelled';
};

const useCancelContentAssignments = (
  assignmentConfigurationUuid,
  refresh,
  tableInstance,
  uuids,
) => {
  const [isOpen, open, close] = useToggle(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const cancelContentAssignments = useCallback(async () => {
    const handleRefresh = () => {
      refresh(tableInstance);
    };
    try {
      const { status } = await EnterpriseAccessApiService.cancelContentAssignments(assignmentConfigurationUuid, uuids);
      if (status === 200) {
        setToastMessage(generateSuccessCancelMessage(uuids));
        setShowToast(true);
        close(true);
        setTimeout(() => {
          handleRefresh();
        }, 2000);
      }
    } catch (err) {
      logError(err);
      close(true);
    }
  }, [assignmentConfigurationUuid, close, refresh, tableInstance, uuids]);

  return {
    cancelContentAssignments,
    close,
    isOpen,
    open,
    setShowToast,
    showToast,
    toastMessage,
  };
};

export default useCancelContentAssignments;
