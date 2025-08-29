import { useCallback, useMemo, useState } from 'react';

const generateSuccessCancelMessage = (assignmentUuidCount) => {
  if (assignmentUuidCount > 1) {
    return `Assignments canceled (${assignmentUuidCount})`;
  }

  return 'Assignment canceled';
};

const generateSuccessApprovalCancelMessage = (approvalCount) => {
  if (approvalCount > 1) {
    return `Approved requests canceled (${approvalCount})`;
  }

  return 'Approved request canceled';
};

const useSuccessfulCancellationToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [assignmentUuidCount, setAssignmentUuidCount] = useState();
  const [approvalCount, setApprovalCount] = useState();
  const [toastType, setToastType] = useState('assignment'); // 'assignment' or 'approval'

  const handleDisplayToast = useCallback((assignmentUuids) => {
    setIsToastOpen(true);
    setAssignmentUuidCount(assignmentUuids);
    setToastType('assignment');
  }, []);

  const handleDisplayApprovalToast = useCallback((count) => {
    setIsToastOpen(true);
    setApprovalCount(count);
    setToastType('approval');
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const successfulAssignmentCancellationToastMessage = generateSuccessCancelMessage(assignmentUuidCount);
  const successfulApprovalCancellationToastMessage = generateSuccessApprovalCancelMessage(approvalCount);

  const toastMessage = toastType === 'approval'
    ? successfulApprovalCancellationToastMessage
    : successfulAssignmentCancellationToastMessage;

  const successfulCancellationToastContextValue = useMemo(() => ({
    isSuccessfulAssignmentCancellationToastOpen: isToastOpen,
    displayToastForAssignmentCancellation: handleDisplayToast,
    displayToastForApprovalCancellation: handleDisplayApprovalToast,
    closeToastForAssignmentCancellation: handleCloseToast,
    successfulAssignmentCancellationToastMessage: toastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleDisplayApprovalToast,
    handleCloseToast,
    toastMessage,
  ]);

  return successfulCancellationToastContextValue;
};

export default useSuccessfulCancellationToastContextValue;
