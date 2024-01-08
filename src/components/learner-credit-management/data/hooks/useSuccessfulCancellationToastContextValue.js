import { useCallback, useMemo, useState } from 'react';

const generateSuccessCancelMessage = (assignmentUuidCount) => {
  if (assignmentUuidCount > 1) {
    return `Assignments canceled (${assignmentUuidCount})`;
  }

  return 'Assignment canceled';
};

const useSuccessfulCancellationToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [assignmentUuidCount, setAssignmentUuidCount] = useState();

  const handleDisplayToast = useCallback((assignmentUuids) => {
    setIsToastOpen(true);
    setAssignmentUuidCount(assignmentUuids);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const successfulAssignmentCancellationToastMessage = generateSuccessCancelMessage(assignmentUuidCount);

  const successfulCancellationToastContextValue = useMemo(() => ({
    isSuccessfulAssignmentCancellationToastOpen: isToastOpen,
    displayToastForAssignmentCancellation: handleDisplayToast,
    closeToastForAssignmentCancellation: handleCloseToast,
    successfulAssignmentCancellationToastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleCloseToast,
    successfulAssignmentCancellationToastMessage,
  ]);

  return successfulCancellationToastContextValue;
};

export default useSuccessfulCancellationToastContextValue;
