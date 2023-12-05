import { useCallback, useMemo, useState } from 'react';

const useSuccessfulAssignmentToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [learnersAllocatedCount, setLearnersAllocatedCount] = useState(0);
  const [learnersAlreadyAllocatedCount, setLearnersAlreadyAllocatedCount] = useState(0);

  const handleDisplayToast = useCallback(({ totalLearnersAllocated, totalLearnersAlreadyAllocated }) => {
    setLearnersAllocatedCount(totalLearnersAllocated);
    setLearnersAlreadyAllocatedCount(totalLearnersAlreadyAllocated);
    setIsToastOpen(true);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const pluralizeLearner = (count) => (count === 1 ? 'learner' : 'learners');

  const toastMessages = [];
  if (learnersAllocatedCount > 0) {
    toastMessages.push(`Course successfully assigned to ${learnersAllocatedCount} ${pluralizeLearner(learnersAllocatedCount)}.`);
  }
  if (learnersAlreadyAllocatedCount > 0) {
    toastMessages.push(`${learnersAlreadyAllocatedCount} ${pluralizeLearner(learnersAlreadyAllocatedCount)} already had this course assigned.`);
  }
  const successfulAssignmentAllocationToastMessage = toastMessages.join(' ');

  const successfulAssignmentToast = useMemo(() => ({
    isSuccessfulAssignmentAllocationToastOpen: isToastOpen,
    displayToastForAssignmentAllocation: handleDisplayToast,
    closeToastForAssignmentAllocation: handleCloseToast,
    totalLearnersAllocated: learnersAllocatedCount,
    totalLearnersAlreadyAllocated: learnersAlreadyAllocatedCount,
    successfulAssignmentAllocationToastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleCloseToast,
    learnersAllocatedCount,
    learnersAlreadyAllocatedCount,
    successfulAssignmentAllocationToastMessage,
  ]);

  return successfulAssignmentToast;
};

export default useSuccessfulAssignmentToastContextValue;
