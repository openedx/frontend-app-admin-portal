import { useCallback, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useToggle } from '@edx/paragon';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

const generateSuccessRemindMessage = (assignmentUuids) => {
  if (Array.isArray(assignmentUuids)) {
    return `Reminders sent (${assignmentUuids.length})`;
  }
  return 'Reminder sent';
};

const useRemindContentAssignments = (assignmentConfigurationUuid, refresh, tableInstance, uuids) => {
  const [isOpen, open, close] = useToggle(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const remindContentAssignments = useCallback(async () => {
    try {
      const { status } = await EnterpriseAccessApiService.remindContentAssignments(assignmentConfigurationUuid, uuids);
      if (status === 200) {
        setToastMessage(generateSuccessRemindMessage(uuids));
        setShowToast(true);
        close(true);
        setTimeout(() => {
          refresh(tableInstance);
        }, 2000);
      }
    } catch (err) {
      logError(err);
      close(true);
    }
  }, [assignmentConfigurationUuid, close, refresh, tableInstance, uuids]);

  return {
    remindContentAssignments,
    close,
    isOpen,
    open,
    setShowToast,
    showToast,
    toastMessage,
  };
};

export default useRemindContentAssignments;
