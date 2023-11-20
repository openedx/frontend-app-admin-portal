import { useCallback, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { useToggle } from '@edx/paragon';

const generateSuccessCancelMessage = (assignmentUuids) => {
  if (Array.isArray(assignmentUuids)) { 
    return `Assignments cancelled (${assignmentUuids.length})`; 
  } else {
    return `Assignment cancelled`; 
  }
};

const useCancelContentAssignments = (assignmentConfigurationUuid, refresh, tableInstance, uuids) => {
  const [isOpen, open, close] = useToggle(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const handleRefresh = () => {
    refresh(tableInstance);
  };

  const cancelContentAssignments = useCallback(async () => {
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
  }, [assignmentConfigurationUuid, uuids]);

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