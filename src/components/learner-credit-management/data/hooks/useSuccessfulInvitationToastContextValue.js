import { useCallback, useMemo, useState } from 'react';
import { makePlural } from '../../../../utils';

const useSuccessfulInvitationToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [learnersInvitedCount, setLearnersInvitedCount] = useState(0);

  const handleDisplayToast = useCallback(({ totalLearnersInvited }) => {
    setLearnersInvitedCount(totalLearnersInvited);
    setIsToastOpen(true);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const toastMessages = [];
  if (learnersInvitedCount > 0) {
    toastMessages.push(`${makePlural(learnersInvitedCount, 'new member')} successfully added.`);
  }
  const successfulInvitationToastMessage = toastMessages.join(' ');

  const successfulInvitationToast = useMemo(() => ({
    isSuccessfulInvitationToastOpen: isToastOpen,
    displayToastForInvitation: handleDisplayToast,
    closeToastForInvitation: handleCloseToast,
    totalLearnersInvited: learnersInvitedCount,
    successfulInvitationToastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleCloseToast,
    learnersInvitedCount,
    successfulInvitationToastMessage,
  ]);

  return successfulInvitationToast;
};

export default useSuccessfulInvitationToastContextValue;
