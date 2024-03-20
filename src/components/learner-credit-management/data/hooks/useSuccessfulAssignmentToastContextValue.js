import { useCallback, useMemo, useState } from 'react';
import { makePlural } from '../../../../utils';

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

  const toastMessages = [];
  if (learnersAllocatedCount > 0) {
    toastMessages.push(`Course successfully assigned to ${makePlural(learnersAllocatedCount, 'learner')}.`);
  }
  if (learnersAlreadyAllocatedCount > 0) {
    toastMessages.push(`${makePlural(learnersAlreadyAllocatedCount, 'learner')} already had this course assigned.`);
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
