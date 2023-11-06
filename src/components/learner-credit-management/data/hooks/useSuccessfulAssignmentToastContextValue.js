import { useCallback, useMemo, useState } from 'react';

const useSuccessfulAssignmentToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [learnersAssignedCount, setLearnersAssignedCount] = useState();

  const handleDisplayToast = useCallback(({ totalLearnersAssigned }) => {
    setIsToastOpen(true);
    setLearnersAssignedCount(totalLearnersAssigned);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const successfulAssignmentAllocationToastMessage = `Course successfully assigned to ${learnersAssignedCount} ${learnersAssignedCount === 1 ? 'learner' : 'learners'}.`;

  const successfulAssignmentToastContextValue = useMemo(() => ({
    isSuccessfulAssignmentAllocationToastOpen: isToastOpen,
    displayToastForAssignmentAllocation: handleDisplayToast,
    closeToastForAssignmentAllocation: handleCloseToast,
    totalLearnersAssigned: learnersAssignedCount,
    successfulAssignmentAllocationToastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleCloseToast,
    learnersAssignedCount,
    successfulAssignmentAllocationToastMessage,
  ]);

  return successfulAssignmentToastContextValue;
};

export default useSuccessfulAssignmentToastContextValue;
