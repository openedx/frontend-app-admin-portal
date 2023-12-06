import { useCallback, useMemo, useState } from 'react';

const generateSuccessRemindMessage = (assignmentUuidCount) => {
  if (assignmentUuidCount > 1) {
    return `Reminders sent (${assignmentUuidCount})`;
  }
  return 'Reminder sent';
};

const useSuccessfulReminderToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [assignmentUuidCount, setAssignmentUuidCount] = useState();

  const handleDisplayToast = useCallback((assignmentUuids) => {
    setIsToastOpen(true);
    setAssignmentUuidCount(assignmentUuids);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const successfulAssignmentReminderToastMessage = generateSuccessRemindMessage(assignmentUuidCount);

  const successfulReminderToastContextValue = useMemo(() => ({
    isSuccessfulAssignmentReminderToastOpen: isToastOpen,
    displayToastForAssignmentReminder: handleDisplayToast,
    closeToastForAssignmentReminder: handleCloseToast,
    successfulAssignmentReminderToastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleCloseToast,
    successfulAssignmentReminderToastMessage,
  ]);
  return successfulReminderToastContextValue;
};

export default useSuccessfulReminderToastContextValue;
